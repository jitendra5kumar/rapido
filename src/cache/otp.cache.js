const redis = require('./redisClient');

const setOtp = async (phone, otp) => {
  await redis.set(`otp:${phone}`, otp, 'EX', 300); // 5 minutes TTL
};

const getOtp = async (phone) => {
  return await redis.get(`otp:${phone}`);
};

const deleteOtp = async (phone) => {
  await redis.del(`otp:${phone}`);
};

const setData = async (phone, data) => {
  await redis.set(`otp:${phone}:data`, JSON.stringify(data), 'EX', 300);
};

const getData = async (phone) => {
  const data = await redis.get(`otp:${phone}:data`);
  return data ? JSON.parse(data) : null;
};

const deleteData = async (phone) => {
  await redis.del(`otp:${phone}:data`);
};

module.exports = {
  setOtp,
  getOtp,
  deleteOtp,
  setData,
  getData,
  deleteData,
};