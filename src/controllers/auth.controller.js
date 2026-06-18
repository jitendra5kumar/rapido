import mongoose from 'mongoose';
import * as authService from '../services/auth.service.js';
import { cacheFcmToken } from '../services/notification.service.js';
import User from '../models/user.model.js';
import sessionCache from '../cache/session.cache.js';
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
  const { phone, name, gender, referral_code, device } = req.body;
  const result = await authService.completeProfile(
    phone,
    name,
    gender,
    referral_code,
    device
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

export const saveFcmToken = asyncHandler(async (req, res) => {
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
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await authService.changePassword(req.user.id, {
    currentPassword,
    newPassword,
  });

  return response.success(res, result.message, result);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete associated driver document if exists
    try {
      const DriverModel = mongoose.model('Driver');
      await DriverModel.deleteMany({ userId: userId });
      if (user.driver_id) {
        await DriverModel.findByIdAndDelete(user.driver_id);
      }
    } catch (err) {
      console.error('Error deleting driver doc:', err);
    }

    // Delete associated driver document details if exists
    try {
      const DriverDocModel = mongoose.model('DriverDocument');
      await DriverDocModel.deleteMany({ user_id: userId });
    } catch (err) {
      console.error('Error deleting driver document details:', err);
    }

    // Delete associated wallet if exists
    try {
      const WalletModel = mongoose.model('Wallet');
      await WalletModel.deleteMany({ userId: userId });
    } catch (err) {
      console.error('Error deleting wallet:', err);
    }

    // Delete associated wallet transactions if exists
    try {
      const WalletTransactionModel = mongoose.model('WalletTransaction');
      await WalletTransactionModel.deleteMany({ user_id: userId });
    } catch (err) {
      console.error('Error deleting wallet transactions:', err);
    }

    // Delete associated chats if exists
    try {
      const ChatModel = mongoose.model('Chat');
      await ChatModel.deleteMany({ userId: userId });
    } catch (err) {
      console.error('Error deleting chats:', err);
    }

    // Delete associated support chats if exists
    try {
      const SupportChatModel = mongoose.model('SupportChat');
      await SupportChatModel.deleteMany({ userId: userId });
    } catch (err) {
      console.error('Error deleting support chats:', err);
    }

    // Delete user document
    await User.findByIdAndDelete(userId);

    // Delete session cache
    try {
      await sessionCache.deleteSession(userId);
    } catch (err) {
      console.error('Error deleting session cache:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
