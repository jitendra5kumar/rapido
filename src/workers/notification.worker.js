// notification.worker.js

import mongoose from 'mongoose';
import redis from '../config/redis.js';
import { MONGO_URI } from '../config/env.js';

import {
  getDriverFcmToken,
  sendRideNotification,
  removeDriverFcmToken,
} from '../services/notification.service.js';

import {
  NOTIFICATION_STREAM,
  NOTIFICATION_CONSUMER_GROUP,
} from '../config/redis.js';

const CONSUMER_NAME =
  process.env.NOTIFICATION_CONSUMER_NAME ||
  `notification-${process.pid}-${Date.now()}`;

const BLOCK_MS = 5000;
const CLAIM_IDLE_MS = 30000;
const READ_COUNT = 10;
const NOTIFICATION_EXPIRE_MS = 15000;

let isRunning = true;

process.on('SIGINT', async () => {
  console.log('Stopping notification worker...');
  isRunning = false;

  try {
    await mongoose.disconnect();
  } catch (err) {}

  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received...');
  isRunning = false;

  try {
    await mongoose.disconnect();
  } catch (err) {}

  process.exit(0);
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const parseStreamFields = (fields) => {
  const result = {};

  for (let i = 0; i < fields.length; i += 2) {
    result[fields[i]] = fields[i + 1];
  }

  return result;
};

const ensureGroup = async () => {
  try {
    await redis.xgroup(
      'CREATE',
      NOTIFICATION_STREAM,
      NOTIFICATION_CONSUMER_GROUP,
      '$',
      'MKSTREAM'
    );

    console.log(
      'Notification consumer group created'
    );
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
  }
};

const recoverPendingMessages =
  async () => {
    try {
      const result =
        await redis.xautoclaim(
          NOTIFICATION_STREAM,
          NOTIFICATION_CONSUMER_GROUP,
          CONSUMER_NAME,
          CLAIM_IDLE_MS,
          '0-0',
          'COUNT',
          20
        );

      if (result?.[1]?.length) {
        console.log(
          `Recovered ${result[1].length} pending notification messages`
        );
      }
    } catch (err) {
      console.error(
        'XAUTOCLAIM failed:',
        err.message || err
      );
    }
  };

const processNotification =
  async (streamId, fields) => {
    const message =
      parseStreamFields(fields);

    const {
      rideId,
      driverId,
      distance,
      requestedAt,
    } = message;

    if (!rideId || !driverId) {
      await redis.xack(
        NOTIFICATION_STREAM,
        NOTIFICATION_CONSUMER_GROUP,
        streamId
      );

      return;
    }

    try {
      // Prevent duplicate notifications
      const dedupeKey =
        `notify:${rideId}:${driverId}`;

      const dedupe =
        await redis.set(
          dedupeKey,
          '1',
          'NX',
          'EX',
          30
        );

      if (!dedupe) {
        await redis.xack(
          NOTIFICATION_STREAM,
          NOTIFICATION_CONSUMER_GROUP,
          streamId
        );

        return;
      }

      // Expired notification skip
      if (requestedAt) {
        const age =
          Date.now() -
          new Date(requestedAt).getTime();

        if (
          age >
          NOTIFICATION_EXPIRE_MS
        ) {
          console.log(
            `Expired notification skipped for ride ${rideId}`
          );

          await redis.xack(
            NOTIFICATION_STREAM,
            NOTIFICATION_CONSUMER_GROUP,
            streamId
          );

          return;
        }
      }

      const token =
        await getDriverFcmToken(
          driverId
        );

      if (!token) {
        console.warn(
          `Missing FCM token for driver ${driverId}`
        );

        await redis.xack(
          NOTIFICATION_STREAM,
          NOTIFICATION_CONSUMER_GROUP,
          streamId
        );

        return;
      }

      await sendRideNotification({
        driverId,
        rideId,
        token,

        metadata: {
          distance:
            distance || '0',
        },
      });

      console.log(
        `Notification sent to driver ${driverId}`
      );

      await redis.xack(
        NOTIFICATION_STREAM,
        NOTIFICATION_CONSUMER_GROUP,
        streamId
      );
    } catch (err) {
      console.error(
        `Notification processing failed`,
        err.message || err
      );

      const retryableErrors = [
        'messaging/internal-error',
        'messaging/server-unavailable',
      ];

      if (
        retryableErrors.includes(
          err.code
        )
      ) {
        return;
      }

      if (
        err.code ===
          'messaging/registration-token-not-registered' ||
        err.code ===
          'messaging/invalid-registration-token'
      ) {
        await removeDriverFcmToken(
          driverId
        );
      }

      await redis.xack(
        NOTIFICATION_STREAM,
        NOTIFICATION_CONSUMER_GROUP,
        streamId
      );
    }
  };

const startLoop = async () => {
  console.log(
    `Notification worker started as ${CONSUMER_NAME}`
  );

  while (isRunning) {
    try {
      const entries =
        await redis.xreadgroup(
          'GROUP',
          NOTIFICATION_CONSUMER_GROUP,
          CONSUMER_NAME,
          'BLOCK',
          BLOCK_MS,
          'COUNT',
          READ_COUNT,
          'STREAMS',
          NOTIFICATION_STREAM,
          '>'
        );

      if (!entries) {
        continue;
      }

      const tasks = [];

      for (const [, messages] of entries) {
        for (const [
          streamId,
          fields,
        ] of messages) {
          tasks.push(
            processNotification(
              streamId,
              fields
            )
          );
        }
      }

      await Promise.allSettled(tasks);
    } catch (err) {
      console.error(
        'Notification worker loop failed:',
        err.message || err
      );

      await sleep(2000);
    }
  }
};

const bootstrap = async () => {
  if (!MONGO_URI) {
    throw new Error(
      'MONGO_URI is required'
    );
  }

  await mongoose.connect(
    MONGO_URI,
    {
      autoIndex: false,
      maxPoolSize: 30,
    }
  );

  console.log(
    'MongoDB connected'
  );

  await ensureGroup();

  await recoverPendingMessages();

  await startLoop();
};

bootstrap().catch((err) => {
  console.error(
    'Notification worker bootstrap failed:',
    err.message || err
  );

  process.exit(1);
});