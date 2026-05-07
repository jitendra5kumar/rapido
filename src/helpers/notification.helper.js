import { queueNotification } from '../services/notification.service.js';

/**
 * Reusable helper for ride push notification queueing.
 * This helper is used by controllers and workers to enqueue
 * background FCM notification delivery through Redis.
 */
export const sendRidePushNotification = async ({
  targetType,
  targetId,
  event,
  rideId,
  status,
  title,
  body,
  payload = {},
}) => {
  if (!targetType || !targetId || !event || !rideId) {
    throw new Error('Notification target, event and rideId are required');
  }

  return queueNotification({
    targetType,
    targetId,
    event,
    rideId,
    status,
    title,
    body,
    payload,
  });
};
