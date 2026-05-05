import {body } from 'express-validator';

export const sendOtp = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const verifyOtp = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
];

export const login = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('password').exists().withMessage('Password is required'),
];

export const register = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
