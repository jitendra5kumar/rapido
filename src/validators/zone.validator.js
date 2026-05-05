import { body, param } from 'express-validator';

export const createZone = [
  body('name').isLength({ min: 1 }).withMessage('Zone name is required'),
  body('city').isMongoId().withMessage('City ID must be a valid MongoDB ID'),
  body('location').isArray({ min: 4 }).withMessage('Location must be an array of at least 4 points'),
  body('location.*.lat').isFloat().withMessage('Location latitude must be a number'),
  body('location.*.lng').isFloat().withMessage('Location longitude must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

export const updateZone = [
  param('zoneId').isMongoId().withMessage('Zone ID must be a valid MongoDB ID'),
  body('name').optional().isLength({ min: 1 }).withMessage('Zone name must not be empty'),
  body('city').optional().isMongoId().withMessage('City ID must be a valid MongoDB ID'),
  body('location').optional().isArray({ min: 4 }).withMessage('Location must be an array of at least 4 points'),
  body('location.*.lat').optional().isFloat().withMessage('Location latitude must be a number'),
  body('location.*.lng').optional().isFloat().withMessage('Location longitude must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

export const getZone = [
  param('zoneId').isMongoId().withMessage('Zone ID must be a valid MongoDB ID'),
];

export const deleteZone = [
  param('zoneId').isMongoId().withMessage('Zone ID must be a valid MongoDB ID'),
];
