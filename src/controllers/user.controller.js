const userService = require('../services/user.service');
const { asyncHandler } = require('../utils');
const { response } = require('../utils');

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getProfile(userId);
  response.success(res, 'Profile fetched successfully', user);
});

module.exports = {
  getProfile,
};