import * as authService from '../services/auth.service.js';
import {asyncHandler } from '../utils/index.js';
import {response } from '../utils/index.js';

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone, name, password } = req.body;
  await authService.sendOtp(phone, name, password);
  response.success(res, 'OTP sent successfully');
});