import Alert from '../models/alert.model.js';

export const createAlert = async (userId, { title, message, image, userType = 'ALL', users, status = 'ACTIVE', isBroadcast = true }) => {
  const alert = await new Alert({
    title,
    message,
    image,
    userType,
    users,
    createdBy: userId,
    status,
    isBroadcast,
  }).save();

  return alert.populate('createdBy users');
};

export const updateAlert = async (alertId, userId, { title, message, image, userType, users, status, isBroadcast }) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    throw new Error('Alert not found');
  }

  // Only creator or admin can update
  if (alert.createdBy.toString() !== userId) {
    throw new Error('Unauthorized to update this alert');
  }

  if (title) alert.title = title;
  if (message) alert.message = message;
  if (image) alert.image = image;
  if (userType) alert.userType = userType;
  if (users) alert.users = users;
  if (status) alert.status = status;
  if (typeof isBroadcast !== 'undefined') alert.isBroadcast = isBroadcast;

  await alert.save();
  return alert.populate('createdBy users');
};

export const getAlertById = async (alertId) => {
  const alert = await Alert.findById(alertId).populate([
    {
      path: 'createdBy',
      select: 'phone name role'
    },
    {
      path: 'users',
      select: 'phone name role'
    }
  ]);
  if (!alert) {
    throw new Error('Alert not found');
  }
  return alert;
};

export const getAllAlerts = async (filters = {}) => {
  const query = {};
  
  if (filters.userType) query.userType = filters.userType;
  if (filters.status) query.status = filters.status;

 const alerts = await Alert.find(query)
  .populate([
    {
      path: 'createdBy',
      select: 'phone name role'
    },
    {
      path: 'users',
      select: 'phone name role'
    }
  ])
  .sort({ createdAt: -1 });
  
  return alerts;
};

export const getAlertsByUser = async (userId) => {
  const alerts = await Alert.find({createdBy: userId})
    .populate([
    {
      path: 'createdBy',
      select: 'phone name role'
    },
    {
      path: 'users',
      select: 'phone name role'
    }
  ])
    .sort({ createdAt: -1 });
  
  return alerts;
};

export const getAlertsByUserType = async (userType) => {
  const alerts = await Alert.find({
    $or: [
      { userType: 'ALL' },
      { userType }
    ],
    status: 'ACTIVE'
  })
     .populate([
    {
      path: 'createdBy',
      select: 'phone name role'
    },
    {
      path: 'users',
      select: 'phone name role'
    }
  ])
    .sort({ createdAt: -1 });

  return alerts;
};

export const deleteAlert = async (alertId, userId) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    throw new Error('Alert not found');
  }

  if (alert.createdBy.toString() !== userId) {
    throw new Error('Unauthorized to delete this alert');
  }

  await Alert.findByIdAndDelete(alertId);
  return { message: 'Alert deleted successfully' };
};
