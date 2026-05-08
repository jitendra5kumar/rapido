import { body, param } from 'express-validator';

export const createAlert = [
  body('message').isLength({ min: 1 }).withMessage('Alert message is required'),
  body('title').optional().isLength({ min: 1 }).withMessage('Title must not be empty'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('linkUrl').optional().isURL().withMessage('Link URL must be a valid URL'),
  body('userType').optional().isIn(['ALL', 'USER', 'DRIVER', 'SUB_ADMIN']).withMessage('Invalid user type'),
  body('users').optional().isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  body('isBroadcast').optional().isBoolean().withMessage('isBroadcast must be a boolean'),
];

export const updateAlert = [
  param('alertId').isMongoId().withMessage('Alert ID must be a valid MongoDB ID'),
  body('message').optional().isLength({ min: 1 }).withMessage('Message must not be empty'),
  body('title').optional().isLength({ min: 1 }).withMessage('Title must not be empty'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('linkUrl').optional().isURL().withMessage('Link URL must be a valid URL'),
  body('userType').optional().isIn(['ALL', 'USER', 'DRIVER', 'SUB_ADMIN']).withMessage('Invalid user type'),
  body('users').optional().isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE'),
  body('isBroadcast').optional().isBoolean().withMessage('isBroadcast must be a boolean'),
];

export const getAlert = [
  param('alertId').isMongoId().withMessage('Alert ID must be a valid MongoDB ID'),
];

export const deleteAlert = [
  param('alertId').isMongoId().withMessage('Alert ID must be a valid MongoDB ID'),
];

export const getAlertsByType = [
  param('userType').isIn(['ALL', 'USER', 'DRIVER', 'SUB_ADMIN']).withMessage('Invalid user type'),
];
