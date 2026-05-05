import mongoose from 'mongoose';
import redis from '../config/redis.js';

export const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
