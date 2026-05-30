import { body, param } from 'express-validator';

export const changeUserRole = [
  param('userId').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('role').isIn(['rider', 'driver', 'admin', 'sub_admin']).withMessage('Role must be one of rider, driver, admin, sub_admin'),
];

export const updateProfile = [
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('name').optional().isLength({ min: 1 }).withMessage('Name must not be empty'),
  body('last_name').optional().isLength({ min: 1 }).withMessage('Last name must not be empty'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
];

