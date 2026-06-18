import express from 'express';
import * as rideController from '../controllers/ride.controller.js';
import { authMiddleware, requireRoles } from '../middlewares/index.js';
import {
  createRide,
  updateRide,
  getRide,
  updateRideStatus,
  rideAction,
  arriveRide,
  cancelRide,
  updateDropLocation,
  getDriverRides,
} from '../validators/ride.validator.js';
import { handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  rideController.normalizeRidePayload,
  createRide,
  handleValidationErrors,
  rideController.createRide
);

router.get('/user/my', rideController.getMyRides);
router.get('/user/recent', rideController.getRecentRides);
router.get('/driver/my',  rideController.getMyDriverRides);
router.get('/driver/active', rideController.getActiveDriverRide);
router.get('/driver/:driverId/active', requireRoles('admin', 'sub_admin', 'driver'), getDriverRides, handleValidationErrors, rideController.getActiveDriverRideByDriverId);
router.get('/driver/:driverId', requireRoles('admin', 'sub_admin', 'driver'), getDriverRides, handleValidationErrors, rideController.getDriverRides);
router.get('/:rideId', getRide, handleValidationErrors, rideController.getRide);
router.get('/', rideController.getAllRides);
router.put('/:rideId', requireRoles('admin', 'sub_admin', 'driver', 'rider'), getRide, updateRide, handleValidationErrors, rideController.updateRide);
router.post('/:rideId/accept', requireRoles('admin', 'sub_admin', 'driver'), rideAction, handleValidationErrors, rideController.acceptRide);
router.post('/:rideId/arrive', requireRoles('admin', 'sub_admin', 'driver'), rideAction, arriveRide, handleValidationErrors, rideController.arriveRide);
router.post('/:rideId/complete', requireRoles('admin', 'sub_admin', 'driver'), getRide, handleValidationErrors, rideController.completeRide);
router.patch('/:rideId/status', requireRoles('admin', 'sub_admin', 'driver'), updateRideStatus, handleValidationErrors, rideController.updateRideStatusOtp);
router.post('/:rideId/cancel', requireRoles('admin', 'sub_admin', 'driver', 'rider'), cancelRide, handleValidationErrors, rideController.cancelRide);

router.patch('/:rideId/drop', requireRoles('admin', 'sub_admin', 'rider'), getRide, updateDropLocation, handleValidationErrors, rideController.updateDropLocation);

export default router;
