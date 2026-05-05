import redis from './redisClient.js';

const setSession = async (userId, token) => {
  await redis.set(`session:${userId}`, token, 'EX', 3600); // 1 hour TTL
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
