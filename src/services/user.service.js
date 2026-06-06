import User from '../models/user.model.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }
  // Return user data without password
  return {
    id: user._id,
    name: user.name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    pin: user.pin,
    referral_code: user.referral_code,
    wallet: user.wallet,
    profile_image_id: user.profile_image_id,
    referralEarnings: user.referralEarnings,
    totalReferrals: user.totalReferrals,
    createdAt: user.createdAt,
  };
};

export const updateProfile = async (userId, profileData) => {
  const { phone, name, last_name, email } = profileData;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!phone && !name && !last_name && !email) {
    throw new Error('At least one field is required to update');
  }

  if (phone && phone !== user.phone) {
    const existingPhoneUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingPhoneUser) {
      throw new Error('Phone number already in use');
    }
    user.phone = phone;
  }

  if (email && email !== user.email) {
    const existingEmailUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmailUser) {
      throw new Error('Email already in use');
    }
    user.email = email.toLowerCase();
  }

  if (name) {
    user.name = name;
  }

  if (last_name) {
    user.last_name = last_name;
  }

  await user.save();

  return {
    id: user._id,
    name: user.name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    updatedAt: user.updatedAt,
  };
};

export const changeUserRole = async (targetUserId, newRole, performedById, performedByRole) => {
  if (!['admin', 'sub_admin'].includes(performedByRole)) {
    throw new Error('Unauthorized to change user role');
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role === newRole) {
    return {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      message: 'Role is already set to the requested value',
    };
  }

  user.role = newRole;
  await user.save();

  return {
    id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    updatedAt: user.updatedAt,
  };
};

