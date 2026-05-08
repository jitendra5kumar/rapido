// services/notification.service.js

import admin from '../config/firebase.js';
import redis, {
  NOTIFICATION_STREAM,
} from '../config/redis.js';
import User from '../models/user.model.js';

const FCM_CACHE_TTL = 86400;
const FCM_MESSAGE_TTL_MS = 300000;
const INVALID_TOKEN_CODES = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/third-party-auth-error',
];

const buildFcmCacheKey = (
  targetType,
  targetId
) => `${targetType}:fcm:${targetId}`;

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === undefined || value === null
        ? ''
        : String(value),
    ])
  );
};

export const cacheFcmToken = async ({
  targetType,
  targetId,
  token,
}) => {
  try {
    if (!targetType || !targetId || !token) {
      return;
    }

    await redis.set(
      buildFcmCacheKey(targetType, targetId),
      token,
      'EX',
      FCM_CACHE_TTL
    );
  } catch (err) {
    console.error('Cache token error:', err.message || err);
  }
};

export const removeFcmToken = async ({
  targetType,
  targetId,
}) => {
  try {
    if (!targetType || !targetId) {
      return;
    }

    await redis.del(
      buildFcmCacheKey(targetType, targetId)
    );

    await User.updateOne(
      { _id: targetId },
      { $unset: { fcm_token: 1 } }
    );
  } catch (err) {
    console.error('Remove token error:', err.message || err);
  }
};

export const getFcmToken = async ({
  targetType,
  targetId,
}) => {
  try {
    if (!targetType || !targetId) {
      return null;
    }

    const cacheKey =
      buildFcmCacheKey(targetType, targetId);

    const cachedToken = await redis.get(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    const user = await User.findById(targetId)
      .select('fcm_token status')
      .lean();

    if (!user || !user.fcm_token || user.status !== 'active') {
      return null;
    }

    await cacheFcmToken({
      targetType,
      targetId,
      token: user.fcm_token,
    });

    return user.fcm_token;
  } catch (err) {
    console.error('Get token error:', err.message || err);

    return null;
  }
};

const isInvalidTokenError = (err) =>
  err &&
  typeof err.code === 'string' &&
  INVALID_TOKEN_CODES.includes(err.code);

export const sendFirebaseMessage = async ({
  token,
  title,
  body,
  event,
  rideId,
  status,
  payload = {},
}) => {
  if (!token) {
    throw new Error('Missing FCM token');
  }

  const normalizedPayload = normalizePayload(payload);

  const message = {
    token,
    android: {
      priority: 'high',
      ttl: FCM_MESSAGE_TTL_MS,
      notification: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
        'apns-expiration': String(
          Math.floor(Date.now() / 1000 + FCM_MESSAGE_TTL_MS / 1000)
        ),
      },
      payload: {
        aps: {
          sound: 'default',
          category: 'RIDE_UPDATE',
        },
      },
    },
    notification: {
      title,
      body,
    },
    data: {
      type: event || 'general_notification',
      rideId: String(rideId || ''),
      status: String(status || ''),
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      ...normalizedPayload,
    },
  };

  return admin.messaging().send(message);
};

export const queueNotification = async ({
  targetType,
  targetId,
  event,
  rideId,
  status = '',
  title,
  body,
  payload = {},
}) => {
  if (!targetType || !targetId || !event || !rideId || !title || !body) {
    throw new Error('Missing notification payload fields');
  }

  const payloadJson = JSON.stringify(payload || {});

  return redis.xadd(
    NOTIFICATION_STREAM,
    '*',
    'targetType',
    targetType,
    'targetId',
    String(targetId),
    'event',
    event,
    'rideId',
    String(rideId),
    'status',
    String(status || ''),
    'title',
    title,
    'body',
    body,
    'payload',
    payloadJson,
    'sentAt',
    new Date().toISOString()
  );
};

export const sendNotificationToUser = async ({
  userId,
  ...rest
}) => {
  return queueNotification({
    targetType: 'user',
    targetId: userId,
    ...rest,
  });
};

export const sendNotificationToDriver = async ({
  driverId,
  ...rest
}) => {
  return queueNotification({
    targetType: 'driver',
    targetId: driverId,
    ...rest,
  });
};

export const sendNotificationByRole = async (
  role,
  title,
  body
) => {
  try {
    if (!role) {
      throw new Error('Role is required');
    }

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    const users = await User.find({
      role,
      status: 'active',
      fcm_token: { $exists: true, $ne: null },
    }).select('_id fcm_token');

    if (!users.length) {
      throw new Error(`No active ${role} users found`);
    }

    const tokens = users
      .map((user) => user.fcm_token)
      .filter(Boolean);

    if (!tokens.length) {
      throw new Error('No valid FCM tokens found');
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        type: 'general_notification',
      },
      tokens,
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    response.responses.forEach(async (resp, index) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (INVALID_TOKEN_CODES.includes(errorCode)) {
          const invalidUser = users[index];
          if (invalidUser) {
            await User.updateOne(
              { _id: invalidUser._id },
              { $unset: { fcm_token: 1 } }
            );
          }
        }
      }
    });

    return {
      totalUsers: users.length,
      totalTokens: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (err) {
    console.error('Send role notification error:', err.message || err);
    throw err;
  }
};
