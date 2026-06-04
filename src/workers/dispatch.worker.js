// dispatch.worker.js

import mongoose from 'mongoose';
import redis from '../config/redis.js';
import { MONGO_URI } from '../config/env.js';
import Ride from '../models/ride.model.js';

import {
  findNearbyAvailableDrivers,
} from '../services/driverLocation.service.js';
import {
  queueNotification,
} from '../services/notification.service.js';
import {
  NOTIFICATION_EVENTS,
} from '../utils/constants.js';

import {
  RIDE_REQUESTS_STREAM,
  NOTIFICATION_STREAM,
  DISPATCH_CONSUMER_GROUP,
} from '../config/redis.js';

const CONSUMER_NAME =
  process.env.DISPATCH_CONSUMER_NAME ||
  `dispatch-${process.pid}-${Date.now()}`;

const BLOCK_MS = 5000;
const CLAIM_IDLE_MS = 30000;
const DRIVER_LOCK_TTL = 20;
const DRIVER_RESPONSE_TIMEOUT = 15000;
const MAX_DRIVER_ATTEMPTS = 5;

let isRunning = true;

process.on('SIGINT', async () => {
  console.log('Gracefully shutting down dispatch worker...');
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

const ensureConsumerGroup = async () => {
  try {
    await redis.xgroup(
      'CREATE',
      RIDE_REQUESTS_STREAM,
      DISPATCH_CONSUMER_GROUP,
      '$',
      'MKSTREAM'
    );

    console.log('Dispatch consumer group created');
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
  }
};

const autoClaimPendingMessages = async () => {
  try {
    const result = await redis.xautoclaim(
      RIDE_REQUESTS_STREAM,
      DISPATCH_CONSUMER_GROUP,
      CONSUMER_NAME,
      CLAIM_IDLE_MS,
      '0-0',
      'COUNT',
      10
    );
    if (result?.[1]?.length) {
      console.log(
        `Recovered ${result[1].length} stale messages`
      );
    }
  } catch (err) {
    console.error(
      'XAUTOCLAIM failed:',
      err.message || err
    );
  }
};

const acquireDriverLock = async ({
  driverId,
  rideId,
}) => {
  const lockKey = `driver_lock:${driverId}`;

  const result = await redis.set(
    lockKey,
    rideId,
    'NX',
    'EX',
    DRIVER_LOCK_TTL
  );

  return !!result;
};

const releaseDriverLock = async (driverId) => {
  const lockKey = `driver_lock:${driverId}`;

  await redis.del(lockKey);
};

const notifyDriver = async ({
  rideId,
  driverId,
  distance,
}) => {
  await queueNotification({
    targetType: 'driver',
    targetId: driverId,
    event: NOTIFICATION_EVENTS.RIDE_REQUEST,
    rideId,
    status: 'searching',
    title: 'New ride request',
    body: 'You have a new nearby ride request.',
    payload: {
      distance,
    },
  });
};

const notifyUserDriverFound = async ({
  rideId,
  userId,
}) => {
  const lockKey = `ride_notify_found:${rideId}`;
  const created = await redis.set(
    lockKey,
    '1',
    'NX',
    'EX',
    300
  );

  if (!created) {
    return;
  }

  await queueNotification({
    targetType: 'user',
    targetId: userId,
    event: NOTIFICATION_EVENTS.RIDE_DRIVER_FOUND,
    rideId,
    status: 'searching',
    title: 'Driver found nearby',
    body: 'We found a driver close to your pickup location.',
    payload: {
      rideId,
    },
  });
};

const waitForDriverResponse = async ({
  rideId,
  driverId,
}) => {
  const startedAt = Date.now();

  while (
    Date.now() - startedAt <
    DRIVER_RESPONSE_TIMEOUT
  ) {
    const ride = await Ride.findById(rideId)
      .select('status driverId')
      .lean();

    if (!ride) {
      return false;
    }

    if (
      ride.status === 'accepted' &&
      ride.driverId?.toString() ===
        driverId.toString()
    ) {
      return true;
    }

    await sleep(1000);
  }

  return false;
};

const processRideRequest = async (
  streamId,
  fields
) => {
  const message = parseStreamFields(fields);

  const rideId = message.rideId;

  if (!rideId) {
    await redis.xack(
      RIDE_REQUESTS_STREAM,
      DISPATCH_CONSUMER_GROUP,
      streamId
    );

    return;
  }

  try {
    const ride = await Ride.findById(rideId)
      .select(`_id status pickupLocation userId vehicleId dispatchMeta`)
      .lean();

    if (!ride) {
      await redis.xack(
        RIDE_REQUESTS_STREAM,
        DISPATCH_CONSUMER_GROUP,
        streamId
      );
      return;
    }

    if (ride.status !== 'searching') {
      await redis.xack(
        RIDE_REQUESTS_STREAM,
        DISPATCH_CONSUMER_GROUP,
        streamId
      );

      return;
    }

    const [longitude, latitude] =
      ride.pickupLocation.coordinates || [];

    if (!longitude || !latitude) {
      console.error(
        `Invalid coordinates for ride ${rideId}`
      );

      await redis.xack(
        RIDE_REQUESTS_STREAM,
        DISPATCH_CONSUMER_GROUP,
        streamId
      );

      return;
    }

  
    const nearbyDrivers =
      await findNearbyAvailableDrivers({
        longitude,
        latitude,
        radiusMeters: 3000,
        limit: 20,
        vehicleId: ride.vehicleId,
      });

    console.log(
      `Dispatch: found ${nearbyDrivers.length} nearby drivers for ride ${rideId} (vehicleId=${ride.vehicleId})`
    );

    if (!nearbyDrivers.length) {
      console.log(
        `No nearby drivers found for ride ${rideId}`
      );

      await Ride.updateOne(
        { _id: rideId },
        {
          $set: {
            status: 'no_driver_found',
          },
        }
      );

      if (ride.userId) {
        await queueNotification({
          targetType: 'user',
          targetId: ride.userId.toString(),
          event: NOTIFICATION_EVENTS.NO_DRIVER_FOUND,
          rideId,
          status: 'no_driver_found',
          title: 'No drivers available',
          body: 'We could not find a driver nearby right now.',
          payload: {
            pickupAddress:
              ride.pickupLocation?.address || '',
          },
        });
      }

      await redis.xack(
        RIDE_REQUESTS_STREAM,
        DISPATCH_CONSUMER_GROUP,
        streamId
      );

      return;
    }

    if (ride.userId) {
      await notifyUserDriverFound({
        rideId,
        userId: ride.userId.toString(),
      });
    }

    let assigned = false;
    let attemptCount = 0;

    for (const driver of nearbyDrivers) {
      if (attemptCount >= MAX_DRIVER_ATTEMPTS) {
        break;
      }

      attemptCount++;

      const lockAcquired =
        await acquireDriverLock({
          driverId: driver.driverId,
          rideId,
        });

      if (!lockAcquired) {
        continue;
      }

      try {
        await notifyDriver({
          rideId,
          driverId: driver.driverId,
          distance: driver.distance,
        });

        console.log(
          `Ride ${rideId} sent to driver ${driver.driverId}`
        );

        const accepted =
          await waitForDriverResponse({
            rideId,
            driverId: driver.driverId,
          });

        if (accepted) {
          assigned = true;

          console.log(
            `Ride ${rideId} accepted by ${driver.driverId}`
          );

          break;
        }

        await releaseDriverLock(driver.driverId);
      } catch (err) {
        console.error(
          `Driver notify failed`,
          err.message || err
        );

        await releaseDriverLock(driver.driverId);
      }
    }

    if (!assigned) {
      console.log(
        `Ride ${rideId} was not accepted`
      );

      await Ride.updateOne(
        {
          _id: rideId,
          status: 'searching',
        },
        {
          $set: {
            status: 'search_timeout',
          },
        }
      );
    }

    await redis.xack(
      RIDE_REQUESTS_STREAM,
      DISPATCH_CONSUMER_GROUP,
      streamId
    );
  } catch (err) {
    console.error(
      `processRideRequest error`,
      err.message || err
    );
  }
};

const startWorkerLoop = async () => {
  console.log(
    `Dispatch worker running as ${CONSUMER_NAME}`
  );

  while (isRunning) {
    try {
      const streams = await redis.xreadgroup(
        'GROUP',
        DISPATCH_CONSUMER_GROUP,
        CONSUMER_NAME,
        'BLOCK',
        BLOCK_MS,
        'COUNT',
        5,
        'STREAMS',
        RIDE_REQUESTS_STREAM,
        '>'
      );

      if (!streams) {
        continue;
      }

      for (const [, messages] of streams) {
        for (const [streamId, fields] of messages) {
          await processRideRequest(
            streamId,
            fields
          );
        }
      }
    } catch (err) {
      console.error(
        `Worker loop failed`,
        err.message || err
      );

      await sleep(2000);
    }
  }
};

const bootstrap = async () => {
  if (!MONGO_URI) {
    throw new Error(
      'MONGO_URI missing'
    );
  }

  await mongoose.connect(MONGO_URI, {
    autoIndex: false,
    maxPoolSize: 50,
  });

  console.log('MongoDB connected');

  await ensureConsumerGroup();

  await autoClaimPendingMessages();

  await startWorkerLoop();
};

bootstrap().catch((err) => {
  console.error(
    `Dispatch worker bootstrap failed`,
    err.message || err
  );

  process.exit(1);
});