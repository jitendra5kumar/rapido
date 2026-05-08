/**
 * Emit socket events for ride lifecycle updates.
 * This helper keeps runtime Socket.IO emits centralized,
 * so controller flow remains consistent and testable.
 */
export const emitRideEvent = async ({
  targetType,
  targetId,
  event,
  payload = {},
}) => {
  if (!global.io) {
    return;
  }

  if (!event || !targetType || !targetId) {
    return;
  }

  const room = targetId.toString();
  global.io.to(room).emit(event, payload);
};
