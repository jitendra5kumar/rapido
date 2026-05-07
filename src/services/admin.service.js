import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { jwt } from '../utils/index.js';
import crypto from 'crypto';

const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const createSubAdmin = async ({
  name,
  phone,
  password,
  email,
}) => {
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new Error('User already exists with this phone number');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = generateReferralCode();
    const exists = await User.findOne({ referral_code: referralCode });
    if (!exists) isUnique = true;
  }

  const subAdmin = await User.create({
    name,
    phone,
    password: hashedPassword,
    email: email || null,
    role: 'sub_admin',
    status: 'active',
    referral_code: referralCode,
  });

  return {
    id: subAdmin._id,
    name: subAdmin.name,
    phone: subAdmin.phone,
    email: subAdmin.email,
    role: subAdmin.role,
    status: subAdmin.status,
  };
};

export const getSubAdmins = async () => {
  const subAdmins = await User.find({ role: 'sub_admin' })
    .select('_id name phone email status createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return subAdmins;
};

export const getSubAdminById = async (subAdminId) => {
  const subAdmin = await User.findOne({
    _id: subAdminId,
    role: 'sub_admin',
  })
    .select('_id name phone email status createdAt')
    .lean();

  if (!subAdmin) {
    throw new Error('Sub admin not found');
  }

  return subAdmin;
};

export const updateSubAdmin = async (
  subAdminId,
  { name, email, status }
) => {
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (status && ['active', 'inactive', 'blocked'].includes(status)) {
    updateData.status = status;
  }

  const subAdmin = await User.findByIdAndUpdate(
    subAdminId,
    updateData,
    { new: true, runValidators: true }
  )
    .select('_id name phone email status createdAt')
    .lean();

  if (!subAdmin) {
    throw new Error('Sub admin not found');
  }

  return subAdmin;
};

export const deleteSubAdmin = async (subAdminId) => {
  const subAdmin = await User.findByIdAndUpdate(
    subAdminId,
    { deleted_at: new Date() },
    { new: true }
  ).lean();

  if (!subAdmin) {
    throw new Error('Sub admin not found');
  }

  return { success: true, message: 'Sub admin deleted' };
};

export const resetUserPassword = async (userId, newPassword) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } }
  );

  return {
    success: true,
    message: 'User password reset successfully',
    userId,
    phone: user.phone,
  };
};

export const updateUserStatus = async (userId, status) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const validStatuses = ['active', 'inactive', 'blocked'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Must be active, inactive, or blocked');
  }

  if (user.status === status) {
    throw new Error(`User is already ${status}`);
  }

  await User.updateOne(
    { _id: userId },
    { $set: { status } }
  );

  return {
    success: true,
    message: `User status changed to ${status} successfully`,
    userId,
    phone: user.phone,
    name: user.name,
    status,
  };
};
