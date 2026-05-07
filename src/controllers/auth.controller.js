import * as authService from '../services/auth.service.js';
import {asyncHandler } from '../utils/index.js';
import {response } from '../utils/index.js';

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone, name, password } = req.body;
  await authService.sendOtp(phone, name, password);
  response.success(res, 'OTP sent successfully');
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyOtp(phone, otp);
  response.success(res, 'OTP verified and logged in', result);
});

export const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const result = await authService.login(phone, password);
  response.success(res, 'Login successful', result);
});

export const register = asyncHandler(async (req, res) => {
  const { phone, name, password } = req.body;
 
  const result = await authService.register(phone, name, password);
  response.success(res, 'Registration successful', result);
});


export const saveFcmToken = async (req, res) => {
  try {
    const userId = req.user.id; // auth se aayega
    const { fcm_token } = req.body;

    await User.findByIdAndUpdate(userId, {
      fcm_token
    });

    res.json({
      success: true,
      message: "Token saved"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
