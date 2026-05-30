import {body } from 'express-validator';

export const sendOtp = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
];

export const verifyOtp = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('otp').isLength({ min: 4, max: 4 }).isNumeric().withMessage('OTP must be 4 digits'),
];

export const completeProfile = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be male, female, or other'),
  body('referral_code').optional().isString().withMessage('Referral code must be a string'),
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

export const adminLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password is required'),
];

export const adminRegister = [
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
];

export const changePassword = [
  body('currentPassword')
    .isLength({ min: 6 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  body('confirmPassword')
    .isLength({ min: 6 })
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];
