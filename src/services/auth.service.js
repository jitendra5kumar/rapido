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

export const verifyOtp = async (phone, otp) => {
  const storedOtp = await otpCache.getOtp(phone);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error('Invalid or expired OTP');
  }
  
  // Get user data
  const userData = await otpCache.getData(phone);
  if (!userData) {
    throw new Error('User data not found');
  }
  
  // Clean up Redis
  await otpCache.deleteOtp(phone);
  await otpCache.deleteData(phone);
  
  // Check if user exists
  let user = await User.findOne({ phone }).lean();
  if (!user) {
    // Create new user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    user = await new User({
      name: userData.name,
      phone,
      password: hashedPassword,
      role: 'rider', // Default role
    }).save();
  }
  
  // Generate JWT
  const token = jwt.generateToken({ id: user._id, phone: user.phone });
  
  // Store session in Redis
  await sessionCache.setSession(user._id.toString(), token);
  
  return { token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } };
};

export const login = async (phone, password) => {
  const user = await User.findOne({ phone }).lean();
  if (!user) {
    throw new Error('User not found');
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }
  
  // Generate JWT
  const token = jwt.generateToken({ id: user._id, phone: user.phone });
  
  // Store session in Redis
  await sessionCache.setSession(user._id.toString(), token);
  
  return { token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } };
};

export const register = async (phone, name, password, role = 'rider') => {
  // Check if user already exists
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new Error('User already registered with this phone number');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const user = await new User({
    name,
    phone,
    password: hashedPassword,
    role,
  }).save();
  
  // Generate JWT
  const token = jwt.generateToken({ id: user._id, phone: user.phone });
  
  // Store session in Redis
  await sessionCache.setSession(user._id.toString(), token);
  
  return { token, user: { id: user._id, name: user.name, phone: user.phone, role: user.role } };
};

