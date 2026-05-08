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
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
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

