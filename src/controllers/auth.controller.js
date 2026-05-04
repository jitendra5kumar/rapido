const authService = require('../services/auth.service');
const { asyncHandler } = require('../utils');
const { response } = require('../utils');

const sendOtp = asyncHandler(async (req, res) => {
  const { phone, name, password } = req.body;
  await authService.sendOtp(phone, name, password);
  response.success(res, 'OTP sent successfully');
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyOtp(phone, otp);
  response.success(res, 'OTP verified and logged in', result);
});

const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const result = await authService.login(phone, password);
  response.success(res, 'Login successful', result);
});

module.exports = {
  sendOtp,
  verifyOtp,
  login,
};