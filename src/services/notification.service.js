// notification.service.js

import admin from '../config/firebase.js';
import redis from '../config/redis.js';
import User from '../models/user.model.js';

const FCM_CACHE_TTL = 86400;

export const cacheDriverFcmToken =
  async (driverId, token) => {
    if (!driverId || !token) {
      return;
    }

    await redis.set(
      `driver:fcm:${driverId}`,
      token,
      'EX',
      FCM_CACHE_TTL
    );
  };

export const removeDriverFcmToken =
  async (driverId) => {
    try {
      await redis.del(
        `driver:fcm:${driverId}`
      );

      await User.updateOne(
        {
          _id: driverId,
        },
        {
          $unset: {
            fcm_token: 1,
          },
        }
      );
    } catch (err) {
      console.error(
        'Failed to remove driver token:',
        err.message || err
      );
    }
  };

export const getDriverFcmToken =
  async (driverId) => {
    try {
      const cacheKey =
        `driver:fcm:${driverId}`;

      const cached =
        await redis.get(cacheKey);

      if (cached) {
        return cached;
      }

      const driver =
        await User.findOne({
          _id: driverId,
          role: 'driver',
          status: 'active',
        })
          .select('fcm_token')
          .lean();

      const token =
        driver?.fcm_token || null;

      if (token) {
        await cacheDriverFcmToken(
          driverId,
          token
        );
      }

      return token;
    } catch (err) {
      console.error(
        'Failed to get FCM token:',
        err.message || err
      );

      return null;
    }
  };

export const sendRideNotification =
  async ({
    driverId,
    rideId,
    token,
    metadata = {},
  }) => {
    if (!token) {
      throw new Error(
        'Missing FCM token'
      );
    }

    const message = {
      token,

      android: {
        priority: 'high',
        ttl: 15000,
      },

      apns: {
        headers: {
          'apns-priority': '10',
        },
      },

      notification: {
        title: 'New Ride Request',
        body:
          'A nearby rider needs pickup.',
      },

      data: {
        type: 'ride_request',

        rideId:
          rideId.toString(),

        ...Object.fromEntries(
          Object.entries(metadata).map(
            ([key, value]) => [
              key,
              String(value),
            ]
          )
        ),
      },
    };

    try {
      const response =
        await admin
          .messaging()
          .send(message);

      return response;
    } catch (err) {
      console.error(
        `FCM send failed for driver ${driverId}`,
        err.message || err
      );

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

      throw err;
    }
  };