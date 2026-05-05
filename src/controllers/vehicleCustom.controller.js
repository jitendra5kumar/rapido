import * as vehicleCustomService from '../services/vehicleCustom.service.js';
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';

export const createVehicleCustom = asyncHandler(async (req, res) => {
  const { categoryId, baseAmount, chargePerKm, chargePerMinute, cancellationCharge, commissionType, commissionRate, status } = req.body;
  const userId = req.user.id;

  const item = await vehicleCustomService.createVehicleCustom(userId, {
    categoryId,
    baseAmount,
    chargePerKm,
    chargePerMinute,
    cancellationCharge,
    commissionType,
    commissionRate,
    status,
  });

  response.success(res, 'Vehicle custom settings created successfully', item, 201);
});

export const updateVehicleCustom = asyncHandler(async (req, res) => {
  const { vehicleCustomId } = req.params;
  const { categoryId, baseAmount, chargePerKm, chargePerMinute, cancellationCharge, commissionType, commissionRate, status } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const item = await vehicleCustomService.updateVehicleCustom(vehicleCustomId, userId, userRole, {
    categoryId,
    baseAmount,
    chargePerKm,
    chargePerMinute,
    cancellationCharge,
    commissionType,
    commissionRate,
    status,
  });

  response.success(res, 'Vehicle custom settings updated successfully', item);
});

export const getVehicleCustom = asyncHandler(async (req, res) => {
  const { vehicleCustomId } = req.params;

  const item = await vehicleCustomService.getVehicleCustomById(vehicleCustomId);
  response.success(res, 'Vehicle custom settings fetched successfully', item);
});

export const getVehicleCustoms = asyncHandler(async (req, res) => {
  const { categoryId, status } = req.query;
  const filters = {
    categoryId,
  };

  if (typeof status !== 'undefined') {
    filters.status = status === 'true';
  }

  const items = await vehicleCustomService.getAllVehicleCustoms(filters);
  response.success(res, 'Vehicle custom settings fetched successfully', items);
});

export const deleteVehicleCustom = asyncHandler(async (req, res) => {
  const { vehicleCustomId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await vehicleCustomService.deleteVehicleCustom(vehicleCustomId, userId, userRole);
  response.success(res, result.message);
});
