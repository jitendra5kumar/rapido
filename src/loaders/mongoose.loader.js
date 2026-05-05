import connectDB from '../config/db.js';

const loadMongoose = async () => {
  await connectDB();
};

export default loadMongoose;
