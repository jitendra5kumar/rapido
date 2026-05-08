import { body, param } from 'express-validator';

export const createSubAdmin = [
  body('name')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .isMobilePhone()
    .withMessage('Phone must be a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
];

export const updateSubAdmin = [
  param('subAdminId')
    .isMongoId()
    .withMessage('Sub admin ID must be a valid MongoDB ID'),
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Status must be active, inactive, or blocked'),
];

export const getSubAdminById = [
  param('subAdminId')
    .isMongoId()
    .withMessage('Sub admin ID must be a valid MongoDB ID'),
];

export const deleteSubAdmin = [
  param('subAdminId')
    .isMongoId()
    .withMessage('Sub admin ID must be a valid MongoDB ID'),
];

export const resetUserPassword = [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const updateUserStatus = [
  body('userId')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),
  body('status')
    .isIn(['active', 'inactive', 'blocked'])
    .withMessage('Status must be active, inactive, or blocked'),
];
