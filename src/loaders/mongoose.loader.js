const connectDB = require('../config/db');

const loadMongoose = async () => {
  await connectDB();
};

module.exports = loadMongoose;