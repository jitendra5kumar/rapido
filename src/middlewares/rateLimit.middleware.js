const rateLimit = require('express-rate-limit');
const redis = require('../config/redis');

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store for distributed rate limiting
  store: {
    incr: async (key) => {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 15 * 60);
      }
      return count;
    },
    resetKey: async (key) => {
      await redis.del(key);
    },
  },
});

module.exports = rateLimitMiddleware;