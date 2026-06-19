import * as userService from '../services/user.service.js';
import {asyncHandler } from '../utils/index.js';
import {response } from '../utils/index.js';

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getProfile(userId);
  response.success(res, 'Profile fetched successfully', user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedUser = await userService.updateProfile(userId, req.body);
  response.success(res, 'Profile updated successfully', updatedUser);
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const performedById = req.user.id;
  const performedByRole = req.user.role;

  const updatedUser = await userService.changeUserRole(userId, role, performedById, performedByRole);
  response.success(res, 'User role updated successfully', updatedUser);
});

export const getallUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  response.success(res, 'Users fetched successfully', users);
});

