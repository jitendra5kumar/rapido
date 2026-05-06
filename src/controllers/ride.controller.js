import * as rideService from '../services/ride.service.js';
import { asyncHandler, response } from '../utils/index.js';

export const createRide = asyncHandler(async (req, res) => {
  const ride = await rideService.createRide({ ...req.body, userId: req.user.id });
  response.success(res, 'Ride request created successfully', ride, 201);
});

export const getRide = asyncHandler(async (req, res) => {
  const ride = await rideService.getRideById(req.params.rideId);
  if (!ride) throw new Error('Ride not found');
  response.success(res, 'Ride fetched successfully', ride);
});

export const getAllRides = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    userId: req.query.userId,
    driverId: req.query.driverId,
  };

  if (req.query.mine === 'true') {
    filters.userId = req.user.id;
  }

  const rides = await rideService.getRides(filters);
  response.success(res, 'Rides fetched successfully', rides);
});

export const getMyRides = asyncHandler(async (req, res) => {
  const rides = await rideService.getRides({ userId: req.user.id });
  response.success(res, 'Your rides fetched successfully', rides);
});

export const updateRide = asyncHandler(async (req, res) => {
  const ride = await rideService.updateRide(req.params.rideId, req.body);
  if (!ride) throw new Error('Ride not found');
  response.success(res, 'Ride updated successfully', ride);
});

export const acceptRide = asyncHandler(async (req, res) => {
  const ride = await rideService.acceptRide(req.params.rideId, req.body.driverId || req.user.id);
  if (!ride) throw new Error('Ride not found');
  response.success(res, 'Ride accepted successfully', ride);
});

export const completeRide = asyncHandler(async (req, res) => {
  const ride = await rideService.completeRide(req.params.rideId);
  if (!ride) throw new Error('Ride not found');
  response.success(res, 'Ride completed successfully', ride);
});

export const cancelRide = asyncHandler(async (req, res) => {
  const ride = await rideService.cancelRide(req.params.rideId, req.body.cancelReason);
  if (!ride) throw new Error('Ride not found');
  response.success(res, 'Ride cancelled successfully', ride);
});
