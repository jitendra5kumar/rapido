const { body } = require('express-validator');

const sendOtp = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('name').isLength({ min: 1 }).withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const verifyOtp = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
];

const login = [
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('password').exists().withMessage('Password is required'),
];

module.exports = {
  sendOtp,
  verifyOtp,
  login,
};