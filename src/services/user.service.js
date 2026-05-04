const User = require('../models/user.model');

const getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }
  // Return user data without password
  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
};

module.exports = {
  getProfile,
};