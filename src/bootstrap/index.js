import expressLoader from '../loaders/express.loader.js';
import mongooseLoader from '../loaders/mongoose.loader.js';
import redisLoader from '../loaders/redis.loader.js';
import firebaseLoader from '../loaders/firebase.loader.js';

export const start = async (app) => {
  await mongooseLoader();
  await redisLoader();
  await firebaseLoader();
  await expressLoader(app);
};
