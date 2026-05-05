import { body, param } from 'express-validator';

export const createCity = [
  body('name').isLength({ min: 1 }).withMessage('City name is required'),
  body('image').isLength({ min: 1 }).withMessage('City image URL is required'),
];

export const updateCity = [
  param('cityId').isMongoId().withMessage('City ID must be a valid MongoDB ID'),
  body('name').optional().isLength({ min: 1 }).withMessage('City name must not be empty'),
  body('image').optional().isLength({ min: 1 }).withMessage('City image URL must not be empty'),
];

export const getCity = [
  param('cityId').isMongoId().withMessage('City ID must be a valid MongoDB ID'),
];

export const deleteCity = [
  param('cityId').isMongoId().withMessage('City ID must be a valid MongoDB ID'),
];
