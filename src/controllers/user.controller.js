import userService from '../services/user.service.js';
import {asyncHandler } from '../utils/index.js';
import {response } from '../utils/index.js';

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getProfile(userId);
  response.success(res, 'Profile fetched successfully', user);
});

export default {
  getProfile,
};
