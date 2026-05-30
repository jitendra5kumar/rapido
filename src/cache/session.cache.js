import redis from './redisClient.js';

const setSession = async (userId, token) => {
  await redis.set(`session:${userId}`, token, 'EX', 2592000); // 30 days TTL
};

const getSession = async (userId) => {
  return await redis.get(`session:${userId}`);
};

const deleteSession = async (userId) => {
  await redis.del(`session:${userId}`);
};

export default {
  setSession,
  getSession,
  deleteSession,
};
