import { body, param } from 'express-validator';

export const changeUserRole = [
  param('userId').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('role').isIn(['rider', 'driver', 'admin', 'sub_admin']).withMessage('Role must be one of rider, driver, admin, sub_admin'),
];

