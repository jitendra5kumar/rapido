import { body, param } from 'express-validator';

export const createZone = [
  body('name').isLength({ min: 1 }).withMessage('Zone name is required'),
  body('city').isMongoId().withMessage('City ID must be a valid MongoDB ID'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('coordinates.*').isFloat().withMessage('Coordinates must be numbers'),
  body('radiusInKm').isFloat({ min: 0.1 }).withMessage('Radius must be a positive number in KM'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

export const updateZone = [
  param('zoneId').isMongoId().withMessage('Zone ID must be a valid MongoDB ID'),
  body('name').optional().isLength({ min: 1 }).withMessage('Zone name must not be empty'),
  body('city').optional().isMongoId().withMessage('City ID must be a valid MongoDB ID'),
  body('coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('coordinates.*').optional().isFloat().withMessage('Coordinates must be numbers'),
  body('radiusInKm').optional().isFloat({ min: 0.1 }).withMessage('Radius must be a positive number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

export const getZone = [
  param('zoneId').isMongoId().withMessage('Zone ID must be a valid MongoDB ID'),
];

export const deleteZone = [
  param('zoneId').isMongoId().withMessage('Zone ID must be a valid MongoDB ID'),
];
