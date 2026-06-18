import { body, param } from 'express-validator';

const locationCoordinatesValidator = (field) =>
  body(`${field}.coordinates`)
    .isArray({ min: 2, max: 2 })
    .withMessage(`${field} coordinates must be an array with two numbers`);

export const createRide = [
  body('pickupLocation.address').isLength({ min: 1 }).withMessage('Pickup address is required'),
  locationCoordinatesValidator('pickupLocation'),
  body('dropLocation.address').isLength({ min: 1 }).withMessage('Drop address is required'),
  locationCoordinatesValidator('dropLocation'),
  body('vehicleId').optional().isMongoId().withMessage('Vehicle ID must be a valid MongoDB ID'),
  body('payment.method')
    .optional()
    .isIn(['cash', 'card', 'upi', 'wallet'])
    .withMessage('Payment method must be one of cash, card, upi, wallet'),
  body('payment.status')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Payment status must be pending, paid, failed, or refunded'),

];

export const updateRide = [
  body('status')
    .optional()
    .isIn(['searching', 'accepted', 'arrived', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Status value is invalid'),
  body('driverId').optional().isMongoId().withMessage('Driver ID must be a valid MongoDB ID'),
  body('cancelReason').optional().isString().withMessage('Cancel reason must be a string'),
  body('payment.method')
    .optional()
    .isIn(['cash', 'card', 'upi', 'wallet'])
    .withMessage('Payment method must be one of cash, card, upi, wallet'),
  body('payment.status')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Payment status must be pending, paid, failed, or refunded'),
];

export const getRide = [
  param('rideId').isMongoId().withMessage('Ride ID must be a valid MongoDB ID'),
];

export const updateRideStatus = [
  param('rideId').isMongoId().withMessage('Ride ID must be a valid MongoDB ID'),
  body('otp').optional().isString().withMessage('OTP must be a string'),
  body('status')
    .optional()
    .isIn(['searching', 'accepted', 'arrived', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Status value is invalid'),
  body('startedAt')
    .optional()
    .isISO8601()
    .withMessage('startedAt must be a valid ISO8601 date string'),
];

export const rideAction = [
  param('rideId').isMongoId().withMessage('Ride ID must be a valid MongoDB ID'),
  body('driverId').optional().isMongoId().withMessage('Driver ID must be a valid MongoDB ID'),
];

export const arriveRide = [
  param('rideId').isMongoId().withMessage('Ride ID must be a valid MongoDB ID'),
  body('otp')
    .optional()
    .isLength({ min: 4, max: 4 })
    .withMessage('OTP must be 4 digits')
    .isNumeric()
    .withMessage('OTP must be numeric'),
];

export const cancelRide = [
  param('rideId').isMongoId().withMessage('Ride ID must be a valid MongoDB ID'),
  body('cancelReason').isLength({ min: 1 }).withMessage('Cancel reason is required'),
];

export const updateDropLocation = [
  param('rideId').isMongoId().withMessage('Ride ID must be a valid MongoDB ID'),
  body('dropLocation.address').optional().isLength({ min: 1 }).withMessage('Drop address must be a non-empty string'),
  body('dropLocation.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('dropLocation.coordinates must be an array with two numbers [lng, lat]'),
  // allow legacy short form 'drop.longitude'/'drop.latitude' via optional checks
  body('drop.longitude').optional().isFloat().withMessage('drop.longitude must be a number'),
  body('drop.latitude').optional().isFloat().withMessage('drop.latitude must be a number'),
  body('distanceMeters').optional().isFloat({ min: 0 }).withMessage('distanceMeters must be a non-negative number'),
  body('durationMinutes').optional().isFloat({ min: 0 }).withMessage('durationMinutes must be a non-negative number'),
];

export const getDriverRides = [
  param('driverId').isMongoId().withMessage('Driver ID must be a valid MongoDB ID'),
];

