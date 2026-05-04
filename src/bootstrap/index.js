const expressLoader = require('../loaders/express.loader');
const mongooseLoader = require('../loaders/mongoose.loader');
const redisLoader = require('../loaders/redis.loader');
const firebaseLoader = require('../loaders/firebase.loader');

const start = async (app) => {
  await mongooseLoader();
  await redisLoader();
  await firebaseLoader();
  await expressLoader(app);
};

module.exports = { start };