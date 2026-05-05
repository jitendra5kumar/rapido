import { body, param, query } from 'express-validator';

export const createVehicleCustom = [
  body('categoryId').isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  body('baseAmount').isFloat({ min: 0 }).withMessage('Base amount is required and must be >= 0'),
  body('chargePerKm').isFloat({ min: 0 }).withMessage('Charge per km is required and must be >= 0'),
  body('chargePerMinute').isFloat({ min: 0 }).withMessage('Charge per minute is required and must be >= 0'),
  body('cancellationCharge').isFloat({ min: 0 }).withMessage('Cancellation charge is required and must be >= 0'),
  body('commissionType').isIn(['percentage', 'fixed']).withMessage('Commission type must be percentage or fixed'),
  body('commissionRate').isFloat({ min: 0 }).withMessage('Commission rate is required and must be >= 0'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

export const updateVehicleCustom = [
  param('vehicleCustomId').isMongoId().withMessage('Vehicle custom ID must be a valid MongoDB ID'),
  body('categoryId').optional().isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  body('baseAmount').optional().isFloat({ min: 0 }).withMessage('Base amount must be >= 0'),
  body('chargePerKm').optional().isFloat({ min: 0 }).withMessage('Charge per km must be >= 0'),
  body('chargePerMinute').optional().isFloat({ min: 0 }).withMessage('Charge per minute must be >= 0'),
  body('cancellationCharge').optional().isFloat({ min: 0 }).withMessage('Cancellation charge must be >= 0'),
  body('commissionType').optional().isIn(['percentage', 'fixed']).withMessage('Commission type must be percentage or fixed'),
  body('commissionRate').optional().isFloat({ min: 0 }).withMessage('Commission rate must be >= 0'),
  body('status').optional().isBoolean().withMessage('Status must be a boolean'),
];

export const getVehicleCustom = [
  param('vehicleCustomId').isMongoId().withMessage('Vehicle custom ID must be a valid MongoDB ID'),
];

export const deleteVehicleCustom = [
  param('vehicleCustomId').isMongoId().withMessage('Vehicle custom ID must be a valid MongoDB ID'),
];

export const getVehicleCustoms = [
  query('categoryId').optional().isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  query('status').optional().isBoolean().withMessage('Status must be a boolean'),
];
