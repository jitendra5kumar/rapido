import * as authService from '../services/auth.service.js';
import { cacheFcmToken } from '../services/notification.service.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';

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
    const userId = req.user.id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await User.findByIdAndUpdate(userId, {
      fcm_token,
    });

    await cacheFcmToken({
      targetType: 'user',
      targetId: userId,
      token: fcm_token,
    });

    res.json({
      success: true,
      message: 'Token saved',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await authService.changePassword(req.user.id, {
    currentPassword,
    newPassword,
  });

  return response.success(res, result.message, result);
});
