import VehicleCustom from '../models/vehicleCustom.model.js';

export const createVehicleCustom = async (userId, { categoryId, baseAmount, chargePerKm, chargePerMinute, cancellationCharge, commissionType, commissionRate, status = true }) => {
  if (commissionType === 'percentage' && commissionRate > 100) {
    throw new Error('Percentage commission cannot exceed 100');
  }

  const vehicleCustom = await new VehicleCustom({
    categoryId,
    baseAmount,
    chargePerKm,
    chargePerMinute,
    cancellationCharge,
    commissionType,
    commissionRate,
    createdBy: userId,
    status,
  }).save();

  return vehicleCustom.populate('categoryId createdBy');
};

export const updateVehicleCustom = async (vehicleCustomId, userId, userRole, updates) => {
  const vehicleCustom = await VehicleCustom.findById(vehicleCustomId);
  if (!vehicleCustom) {
    throw new Error('Vehicle custom settings not found');
  }

  if (updates.commissionType === 'percentage' && updates.commissionRate > 100) {
    throw new Error('Percentage commission cannot exceed 100');
  }

  const canEdit = vehicleCustom.createdBy.toString() === userId || ['admin', 'sub_admin'].includes(userRole);
  if (!canEdit) {
    throw new Error('Unauthorized to update this item');
  }

  Object.assign(vehicleCustom, updates);
  await vehicleCustom.save();

  return vehicleCustom.populate('categoryId createdBy');
};

export const getVehicleCustomById = async (vehicleCustomId) => {
  const item = await VehicleCustom.findById(vehicleCustomId).populate('categoryId createdBy');
  if (!item) {
    throw new Error('Vehicle custom settings not found');
  }
  return item;
};

export const getAllVehicleCustoms = async (filters = {}) => {
  const query = {};
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (typeof filters.status !== 'undefined') query.status = filters.status;

  const items = await VehicleCustom.find(query)
    .populate('categoryId createdBy')
    .sort({ createdAt: -1 });

  return items;
};

export const deleteVehicleCustom = async (vehicleCustomId, userId, userRole) => {
  const item = await VehicleCustom.findById(vehicleCustomId);
  if (!item) {
    throw new Error('Vehicle custom settings not found');
  }

  const canDelete = item.createdBy.toString() === userId || ['admin', 'sub_admin'].includes(userRole);
  if (!canDelete) {
    throw new Error('Unauthorized to delete this item');
  }

  await VehicleCustom.findByIdAndDelete(vehicleCustomId);
  return { message: 'Vehicle custom settings deleted successfully' };
};
