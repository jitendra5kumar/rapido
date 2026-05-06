import Ride from '../models/ride.model.js';

export const createRide = async (data) => {
  return await Ride.create({
    userId: data.userId,
    driverId: data.driverId || null,
    pickupLocation: {
      type: 'Point',
      coordinates: data.pickupLocation.coordinates,
      address: data.pickupLocation.address,
    },
    dropLocation: {
      type: 'Point',
      coordinates: data.dropLocation.coordinates,
      address: data.dropLocation.address,
    },
    status: data.status || 'searching',
    payment: {
      method: data.payment?.method,
      status: data.payment?.status || 'pending',
      baseFare: Number(data.payment?.baseFare || 0),
      tax: Number(data.payment?.tax || 0),
      platformFee: Number(data.payment?.platformFee || 0),
      zoneCharge: Number(data.payment?.zoneCharge || 0),
      driverTip: Number(data.payment?.driverTip || 0),
      totalFare: Number(data.payment?.totalFare || 0),
    },
    requestedAt: data.requestedAt || Date.now(),
  });
};

export const getRides = async (filters = {}) => {
  const query = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.driverId) query.driverId = filters.driverId;
  if (filters.status) query.status = filters.status;

  return await Ride.find(query).sort({ createdAt: -1 });
};

export const getRideById = async (id) => {
  return await Ride.findById(id);
};

export const updateRide = async (id, data) => {
  const updateData = {};

  if (data.status) updateData.status = data.status;
  if (data.driverId !== undefined) updateData.driverId = data.driverId;
  if (data.cancelReason !== undefined) updateData.cancelReason = data.cancelReason;

  if (data.pickupLocation) {
    updateData.pickupLocation = {
      type: 'Point',
      coordinates: data.pickupLocation.coordinates,
      address: data.pickupLocation.address,
    };
  }

  if (data.dropLocation) {
    updateData.dropLocation = {
      type: 'Point',
      coordinates: data.dropLocation.coordinates,
      address: data.dropLocation.address,
    };
  }

  if (data.payment) {
    updateData.payment = {
      ...data.payment,
      baseFare: data.payment.baseFare !== undefined ? Number(data.payment.baseFare) : undefined,
      tax: data.payment.tax !== undefined ? Number(data.payment.tax) : undefined,
      platformFee: data.payment.platformFee !== undefined ? Number(data.payment.platformFee) : undefined,
      zoneCharge: data.payment.zoneCharge !== undefined ? Number(data.payment.zoneCharge) : undefined,
      driverTip: data.payment.driverTip !== undefined ? Number(data.payment.driverTip) : undefined,
      totalFare: data.payment.totalFare !== undefined ? Number(data.payment.totalFare) : undefined,
    };
  }

  if (data.acceptedAt) updateData.acceptedAt = data.acceptedAt;
  if (data.startedAt) updateData.startedAt = data.startedAt;
  if (data.completedAt) updateData.completedAt = data.completedAt;
  if (data.cancelledAt) updateData.cancelledAt = data.cancelledAt;

  return await Ride.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const acceptRide = async (id, driverId) => {
  return await Ride.findByIdAndUpdate(
    id,
    {
      driverId,
      status: 'accepted',
      acceptedAt: new Date(),
    },
    { new: true, runValidators: true }
  );
};

export const completeRide = async (id) => {
  return await Ride.findByIdAndUpdate(
    id,
    {
      status: 'completed',
      completedAt: new Date(),
    },
    { new: true, runValidators: true }
  );
};

export const cancelRide = async (id, reason) => {
  return await Ride.findByIdAndUpdate(
    id,
    {
      status: 'cancelled',
      cancelReason: reason,
      cancelledAt: new Date(),
    },
    { new: true, runValidators: true }
  );
};
