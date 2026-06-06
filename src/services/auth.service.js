import axios from 'axios';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import otpCache from '../cache/otp.cache.js';
import sessionCache from '../cache/session.cache.js';
import { jwt } from '../utils/index.js';
import crypto from "crypto";



const generateReferralCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};


export const sendOtp = async (phone) => {
  if (!phone) throw new Error('Phone number is required');

  // generate 4-digit OTP locally and store in Redis
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  await otpCache.setOtp(phone, otp);

  // keep minimal provider metadata (sessionId when available)
  let sessionId = null;
  try {
    if (process.env.TWOFA_API_KEY) {
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+91' + formattedPhone.replace(/^\+/, '');
      }
      const mode = process.env.TWOFA_MODE || 'AUTOGEN2';
      const template = process.env.TWOFA_TEMPLATE || 'OTP1';
const url = `https://2factor.in/API/V1/${process.env.TWOFA_API_KEY}/SMS/${formattedPhone}/${otp}/${template}`;      const response = await axios.get(url);
      console.log('2factor response:', response.data);
      if (response.data?.Status === 'Success') {
        sessionId = response.data.Details;
      }
    }
  } catch (err) {
    // ignore remote send errors — OTP is still stored locally for verification
    console.error('2factor send warning:', err.message);
  }

  await otpCache.setData(phone, {
    phone,
    provider: 'twofactor',
    sessionId,
  });

  console.log(`OTP for ${phone}: ${otp}`);

  return {
    success: true,
    provider: 'twofactor',
    sessionId,
    message: 'OTP generated and stored',
  };
};

export const verifyOtp = async (phone, otp) => {
  // verify against locally stored OTP in Redis
  const storedOtp = await otpCache.getOtp(phone);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error('Invalid or expired OTP');
  }

  // cleanup and mark verified
  // await otpCache.deleteOtp(phone);
  // await otpCache.deleteData(phone);
  await otpCache.setOtpVerified(phone);

  const user = await User.findOne({ phone });
  const isVerified = user ? Boolean(user.is_verified) : false;
  const result = { phone, otpVerified: true, is_verified: isVerified };

  if (user && isVerified) {
    const token = jwt.generateToken({
      id: user._id,
      phone: user.phone,
      role: user.role,
    });

    await sessionCache.setSession(user._id.toString(), token);
    result.token = token;
  }

  return result;
};

export const completeProfile = async (
  phone,
  name,
  gender,
  referralCode = null
) => {
  const isVerified = await otpCache.isOtpVerified(phone);
  // if (!isVerified) {
  //   throw new Error('OTP not verified or verification expired');
  // }

  await otpCache.deleteOtpVerified(phone);

  let user = await User.findOne({ phone });
  const update = {};
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  
  if (user) {
    if (!user.name && name) update.name = name;
    if (!user.gender && gender) update.gender = gender;

    if (referralCode) {
      const referrer = await User.findOne({ referral_code: referralCode.trim() });
      if (!referrer) {
        throw new Error('Invalid referral code');
      }
      if (referrer._id.toString() === user._id.toString()) {
        throw new Error('Cannot use your own referral code');
      }
      if (!user.referred_by_id) {
        update.referred_by_id = referrer._id;
        referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
        referrer.referralEarnings = (referrer.referralEarnings || 0) + 50;
        await referrer.save();
      }
    }

    if (Object.keys(update).length) {
      await User.updateOne({ _id: user._id }, { $set: update });
      user = await User.findById(user._id);
    }
  } else {
    let uniqueReferralCode = generateReferralCode();
    let isUnique = false;

    while (!isUnique) {
      const exists = await User.findOne({ referral_code: uniqueReferralCode });
      if (!exists) {
        isUnique = true;
      } else {
        uniqueReferralCode = generateReferralCode();
      }
    }

    let referredById = null;
    if (referralCode) {
      const referrer = await User.findOne({ referral_code: referralCode.trim() });
      if (!referrer) {
        throw new Error('Invalid referral code');
      }
      referredById = referrer._id;
      referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + 50;
      await referrer.save();
    }

    user = await new User({
      name,
      phone,
      gender,
      role: 'rider',
      referral_code: uniqueReferralCode,
      referred_by_id: referredById,
      is_verified: true,
      pin,
    }).save();
  }

  const token = jwt.generateToken({
    id: user._id,
    phone: user.phone,
    role: user.role,
  });

  await sessionCache.setSession(user._id.toString(), token);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      gender: user.gender,
      referral_code: user.referral_code,
    },
  };
};

export const logout = async (userId) => {
  await sessionCache.deleteSession(userId);
  return true;
};

export const adminRegister = async ({ email, password, name, phone }) => {
  if (!email || !password || !name || !phone) {
    throw new Error('Name, email, password, and phone are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  const existing = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { phone: normalizedPhone },
    ],
  });

  if (existing) {
    if (existing.email === normalizedEmail) {
      throw new Error('Email already registered');
    }
    if (existing.phone === normalizedPhone) {
      throw new Error('Phone already registered');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const adminUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashedPassword,
    role: 'admin',
    status: 'active',
    is_verified: true,
    email_verified_at: new Date(),
  });

  const token = jwt.generateToken({
    id: adminUser._id,
    phone: adminUser.phone,
    email: adminUser.email,
    role: adminUser.role,
  });

  await sessionCache.setSession(adminUser._id.toString(), token);

  return {
    token,
    user: {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone,
      role: adminUser.role,
      status: adminUser.status,
    },
  };
};

export const adminLogin = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
    role: 'admin',
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password || '');

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.generateToken({
    id: user._id,
    phone: user.phone,
    email: user.email,
    role: user.role,
  });

  await sessionCache.setSession(user._id.toString(), token);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  };
};

export const changePassword = async (
  userId,
  { currentPassword, newPassword }
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new Error(
      'New password must be different from current password'
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } }
  );

  return {
    success: true,
    message: 'Password changed successfully',
  };
};
