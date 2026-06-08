import * as authService from '../services/auth.service.js';
import { cacheFcmToken } from '../services/notification.service.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';



export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return response.error(res, 'Phone number is required', 400);
  }
  
  const result = await authService.sendOtp(phone);
  
  // Return different response based on provider
  response.success(res, result.message || 'OTP sent successfully', {
    phone,
    provider: result.provider,
    message: result.message,
    requestId: result.requestId || null  // For tracking if available
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyOtp(phone, otp);
  response.success(res, 'OTP verified successfully', result);
});

export const completeProfile = asyncHandler(async (req, res) => {
  const { phone, name, gender, referral_code } = req.body;
  const result = await authService.completeProfile(
    phone,
    name,
    gender,
    referral_code
  );
  response.success(res, 'Profile completed and logged in', result);
});
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  response.success(res, 'Logged out successfully', { success: true });
});

export const adminRegister = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;
  const result = await authService.adminRegister({ email, password, name, phone });
  response.success(res, 'Admin registered successfully', result);
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.adminLogin({ email, password });
  response.success(res, 'Admin logged in successfully', result);
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
