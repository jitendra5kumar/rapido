import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import otpCache from '../cache/otp.cache.js';
import sessionCache from '../cache/session.cache.js';
import {jwt } from '../utils/index.js';

export const sendOtp = async (phone, name, password) => {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in Redis
  await otpCache.setOtp(phone, otp);
  
  // Store user data temporarily
  await otpCache.setData(phone, { name, password });
  
  // In production, send OTP via Firebase or SMS service
  console.log(`OTP for ${phone}: ${otp}`);
  
  // For Firebase push notification, you would need device token
  // Example: await sendFirebaseNotification(phone, `Your OTP is ${otp}`);
};