// src/workers/notification.worker.js

import mongoose from 'mongoose';
import redis from '../config/redis.js';
import { MONGO_URI } from '../config/env.js';

import {
  getFcmToken,
  sendFirebaseMessage,
  removeFcmToken,
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
const NOTIFICATION_EXPIRE_MS = 300000;
const NOTIFICATION_RETENTION_HOURS = 24;

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

const safeParseJson = (value) => {
  try {
    return value ? JSON.parse(value) : {};
  } catch (err) {
    return {};
  }
};

const getServerTimeMs = async () => {
  const time = await redis.time();
  if (!time || time.length < 2) {
    return Date.now();
  }

  const seconds = Number(time[0]);
  const microseconds = Number(time[1]);
  return seconds * 1000 + Math.floor(microseconds / 1000);
};

const trimOldNotifications = async () => {
  try {
    const nowMs = await getServerTimeMs();
    const cutoffMs = nowMs - NOTIFICATION_RETENTION_HOURS * 60 * 60 * 1000;
    const minId = `${cutoffMs}-0`;

    const removed = await redis.xtrim(
      NOTIFICATION_STREAM,
      'MINID',
      '~',
      minId
    );

    if (removed) {
      console.log(
        `Trimmed ${removed} old notification entries older than ${NOTIFICATION_RETENTION_HOURS}h`
      );
    }
  } catch (err) {
    console.error('Failed trimming old notification stream entries:', err.message || err);
  }
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

    console.log('Notification consumer group created');
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
  }
};

const recoverPendingMessages = async () => {
  try {
    const result = await redis.xautoclaim(
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
    console.error('XAUTOCLAIM failed:', err.message || err);
  }
};

const processNotification = async (streamId, fields) => {
  const message = parseStreamFields(fields);
  const {
    targetType,
    targetId,
    event,
    rideId,
    status,
    title,
    body,
    payload,
    sentAt,
  } = message;

  if (!targetType || !targetId || !event || !rideId || !title || !body) {
    await redis.xack(
      NOTIFICATION_STREAM,
      NOTIFICATION_CONSUMER_GROUP,
      streamId
    );
    return;
  }

  try {
    const dedupeKey = `notify:${targetType}:${targetId}:${rideId}:${event}`;
    const dedupe = await redis.set(dedupeKey, '1', 'NX', 'EX', 30);
    if (!dedupe) {
      await redis.xack(
        NOTIFICATION_STREAM,
        NOTIFICATION_CONSUMER_GROUP,
        streamId
      );
      return;
    }

    if (sentAt) {
      const age = Date.now() - new Date(sentAt).getTime();
      if (age > NOTIFICATION_EXPIRE_MS) {
        console.log(`Expired notification skipped for ride ${rideId}`);
        await redis.xack(
          NOTIFICATION_STREAM,
          NOTIFICATION_CONSUMER_GROUP,
          streamId
        );
        return;
      }
    }

    const token = await getFcmToken({
      targetType,
      targetId,
    });

    if (!token) {
      console.warn(
        `Missing FCM token for ${targetType} ${targetId}`
      );
      await redis.xack(
        NOTIFICATION_STREAM,
        NOTIFICATION_CONSUMER_GROUP,
        streamId
      );
      return;
    }

    const parsedPayload = safeParseJson(payload);

    await sendFirebaseMessage({
      token,
      title,
      body,
      event,
      rideId,
      status,
      payload: parsedPayload,
    });

    console.log(
      `Notification sent to ${targetType} ${targetId} for ride ${rideId}`
    );
    await redis.xack(
      NOTIFICATION_STREAM,
      NOTIFICATION_CONSUMER_GROUP,
      streamId
    );
  } catch (err) {
    console.error('Notification processing failed:', err.message || err);

    const retryableErrors = [
      'messaging/internal-error',
      'messaging/server-unavailable',
    ];

    const isInvalidToken =
      err?.code === 'messaging/registration-token-not-registered' ||
      err?.code === 'messaging/invalid-registration-token';

    if (isInvalidToken) {
      await removeFcmToken({
        targetType,
        targetId,
      });
    }

    if (retryableErrors.includes(err?.code)) {
      return;
    }

    await redis.xack(
      NOTIFICATION_STREAM,
      NOTIFICATION_CONSUMER_GROUP,
      streamId
    );
  }
};

const startLoop = async () => {
  console.log(`Notification worker started as ${CONSUMER_NAME}`);

  while (isRunning) {
    try {
      const entries = await redis.xreadgroup(
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
        for (const [streamId, fields] of messages) {
          tasks.push(processNotification(streamId, fields));
        }
      }

      await Promise.allSettled(tasks);
      await trimOldNotifications();
    } catch (err) {
      console.error('Notification worker loop failed:', err.message || err);
      await sleep(2000);
    }
  }
};

const bootstrap = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(MONGO_URI, {
    autoIndex: false,
    maxPoolSize: 30,
  });

  console.log('MongoDB connected');

  await ensureGroup();
  await recoverPendingMessages();
  await startLoop();
};

bootstrap().catch((err) => {
  console.error('Notification worker bootstrap failed:', err.message || err);
  process.exit(1);
});
