// controllers/ride.controller.js

import * as rideService from '../services/ride.service.js';

import redis, {
  RIDE_REQUESTS_STREAM,
} from '../config/redis.js';

import {
  asyncHandler,
  response,
} from '../utils/index.js';

export const createRide =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.createRide({
        ...req.body,
        userId: req.user.id,
      });

    try {

      // Push ride into dispatch queue
      await redis.xadd(
        RIDE_REQUESTS_STREAM,

        '*',

        'rideId',
        ride._id.toString(),

        'requestedAt',
        new Date().toISOString()
      );

    } catch (err) {

      console.error(
        'Dispatch queue push failed:',
        err.message || err
      );
    }

    // Socket emit to user
    global.io
      ?.to(req.user.id.toString())
      .emit('ride:created', {
        rideId: ride._id,
        status: ride.status,
      });

    return response.success(
      res,
      'Ride created successfully',
      ride,
      201
    );
  });

export const getRide =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.getRideById(
        req.params.rideId
      );

    if (!ride) {
      return response.error(
        res,
        'Ride not found',
        404
      );
    }

    return response.success(
      res,
      'Ride fetched successfully',
      ride
    );
  });

export const getAllRides =
  asyncHandler(async (req, res) => {

    const filters = {
      status: req.query.status,
      userId: req.query.userId,
      driverId: req.query.driverId,
    };

    if (req.query.mine === 'true') {
      filters.userId = req.user.id;
    }

    const rides =
      await rideService.getRides(
        filters
      );

    return response.success(
      res,
      'Rides fetched successfully',
      rides
    );
  });

export const getMyRides =
  asyncHandler(async (req, res) => {

    const rides =
      await rideService.getRides({
        userId: req.user.id,
      });

    return response.success(
      res,
      'Your rides fetched successfully',
      rides
    );
  });

export const updateRide =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.updateRide(
        req.params.rideId,
        req.body
      );

    if (!ride) {
      return response.error(
        res,
        'Ride not found',
        404
      );
    }

    return response.success(
      res,
      'Ride updated successfully',
      ride
    );
  });

export const acceptRide =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.acceptRide({
        rideId: req.params.rideId,
        driverId: req.user.id,
      });

    if (!ride) {
      return response.error(
        res,
        'Ride already accepted or unavailable',
        409
      );
    }

    // User realtime update
    global.io
      ?.to(ride.userId.toString())
      .emit('ride:accepted', {
        rideId: ride._id,
        driverId:
          ride.driverId,
        status: ride.status,
      });

    return response.success(
      res,
      'Ride accepted successfully',
      ride
    );
  });

export const updateRideStatusOtp =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.startRide({
        rideId:
          req.params.rideId,

        otp:
          req.body.otp,

        driverId:
          req.user.id,
      });

    return response.success(
      res,
      'Ride started successfully',
      ride
    );
  });

export const completeRide =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.completeRide({
        rideId:
          req.params.rideId,

        driverId:
          req.user.id,
      });

    if (!ride) {
      return response.error(
        res,
        'Ride not found',
        404
      );
    }

    global.io
      ?.to(ride.userId.toString())
      .emit('ride:completed', {
        rideId: ride._id,
      });

    return response.success(
      res,
      'Ride completed successfully',
      ride
    );
  });

export const cancelRide =
  asyncHandler(async (req, res) => {

    const ride =
      await rideService.cancelRide({
        rideId:
          req.params.rideId,

        userId:
          req.user.id,

        cancelReason:
          req.body.cancelReason,
      });

    if (!ride) {
      return response.error(
        res,
        'Ride not found',
        404
      );
    }

    return response.success(
      res,
      'Ride cancelled successfully',
      ride
    );
  });