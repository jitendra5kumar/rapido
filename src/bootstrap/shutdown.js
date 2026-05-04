const mongoose = require('mongoose');
const redis = require('../config/redis');

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  await redis.quit();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { shutdown };