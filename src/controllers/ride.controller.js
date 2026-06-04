// controllers/ride.controller.js

import * as rideService from '../services/ride.service.js';
import User from '../models/user.model.js';
import redis, {
  RIDE_REQUESTS_STREAM,
} from '../config/redis.js';
import {
  asyncHandler,
  response,
} from '../utils/index.js';
import { emitRideEvent } from '../helpers/realtime.helper.js';
import { sendRidePushNotification } from '../helpers/notification.helper.js';
import { NOTIFICATION_EVENTS } from '../utils/constants.js';
import Driver from '../models/driver.model.js';
export const normalizeRidePayload = (req, res, next) => {
  const { pickup, drop, paymentMethod, payment } = req.body;

  if (pickup || drop || paymentMethod) {
    req.body = {
      ...req.body,
      pickupLocation:
        req.body.pickupLocation ||
        (pickup
          ? {
              address: pickup.address,
              coordinates: [pickup.longitude, pickup.latitude],
              title: pickup.title,
            }
          : undefined),
      dropLocation:
        req.body.dropLocation ||
        (drop
          ? {
              address: drop.address,
              coordinates: [drop.longitude, drop.latitude],
              title: drop.title,
            }
          : undefined),
      payment:
        payment ||
        (paymentMethod
          ? {
              method: paymentMethod,
            }
          : undefined),
    };
  }

  next();
};
export const createRide =
  asyncHandler(async (req, res) => {
   

    const ridePayload = {
      ...req.body,
      vehicleId: req.body.vehicleId || null,
      pickupLocation:
        req.body.pickupLocation ||
        (req.body.pickup
          ? {
              address: req.body.pickup.address,
              coordinates: [
                req.body.pickup.longitude,
                req.body.pickup.latitude,
              ],
              title: req.body.pickup.title,
            }
          : undefined),
      dropLocation:
        req.body.dropLocation ||
        (req.body.drop
          ? {
              address: req.body.drop.address,
              coordinates: [
                req.body.drop.longitude,
                req.body.drop.latitude,
              ],
              title: req.body.drop.title,
            }
          : undefined),
      payment:
        req.body.payment ||
        (req.body.paymentMethod
          ? {
              method: req.body.paymentMethod,
            }
          : undefined),
      userId: req.user.id,
    };

    const ride =
      await rideService.createRide(ridePayload);

    try {
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

    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: req.user.id,
        event: 'ride:created',
        payload: {
          rideId: ride._id,
          status: ride.status,
        },
      }),
      sendRidePushNotification({
        targetType: 'user',
        targetId: req.user.id,
        event: NOTIFICATION_EVENTS.RIDE_SEARCHING,
        rideId: ride._id,
        status: ride.status,
        title: 'Searching nearby drivers',
        body: 'We are searching for drivers close to your pickup location.',
        payload: {
          pickupAddress:
            ride.pickupLocation?.address || '',
        },
      }),
    ]);

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
      await rideService.getRides(filters);

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
    const driverId=await Driver.findById(req.user.id);
    const ride = await rideService.acceptRide({
      rideId: req.params.rideId,
      driverId: driverId._id,
    });

    if (!ride) {
      return response.error(
        res,
        'Ride already accepted or unavailable',
        409
      );
    }

    const driver = await User.findById(
      ride.driverId
    )
      .select('name phone')
      .lean();

    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: 'ride:accepted',
        payload: {
          rideId: ride._id,
          driverId: ride.driverId,
          status: ride.status,
        },
      }),
      sendRidePushNotification({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: NOTIFICATION_EVENTS.RIDE_ACCEPTED,
        rideId: ride._id,
        status: ride.status,
        title: 'Driver accepted your ride',
        body: `${driver?.name || 'Your driver'} is on the way.`,
        payload: {
          driverName: driver?.name || '',
          driverPhone: driver?.phone || '',
        },
      }),
    ]);

    return response.success(
      res,
      'Ride accepted successfully',
      ride
    );
  });

export const arriveRide =
  asyncHandler(async (req, res) => {
    const ride =
      await rideService.arriveRide({
        rideId: req.params.rideId,
        driverId: req.user.id,
      });

    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: 'ride:arrived',
        payload: {
          rideId: ride._id,
          status: ride.status,
        },
      }),
      sendRidePushNotification({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: NOTIFICATION_EVENTS.RIDE_ARRIVED,
        rideId: ride._id,
        status: ride.status,
        title: 'Driver arrived at pickup',
        body: 'Your driver has arrived at the pickup location.',
        payload: {
          arrivedAt: ride.arrivedAt?.toISOString() || '',
        },
      }),
    ]);

    return response.success(
      res,
      'Driver marked as arrived',
      ride
    );
  });

export const updateRideStatusOtp =
  asyncHandler(async (req, res) => {
    const ride =
      await rideService.startRide({
        rideId: req.params.rideId,
        otp: req.body.otp,
        driverId: req.user.id,
      });

    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: 'ride:started',
        payload: {
          rideId: ride._id,
          status: ride.status,
        },
      }),
      sendRidePushNotification({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: NOTIFICATION_EVENTS.RIDE_STARTED,
        rideId: ride._id,
        status: ride.status,
        title: 'Ride started successfully',
        body: 'Your ride has started. Enjoy the trip!',
        payload: {
          startedAt: ride.startedAt?.toISOString() || '',
        },
      }),
    ]);

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
        rideId: req.params.rideId,
        driverId: req.user.id,
      });

    if (!ride) {
      return response.error(
        res,
        'Ride not found',
        404
      );
    }

    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: 'ride:completed',
        payload: {
          rideId: ride._id,
          status: ride.status,
        },
      }),
      sendRidePushNotification({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: NOTIFICATION_EVENTS.RIDE_COMPLETED,
        rideId: ride._id,
        status: ride.status,
        title: 'Ride completed',
        body: `Your ride is complete. Total fare: ${ride.payment?.totalFare || 0}`,
        payload: {
          totalFare: ride.payment?.totalFare || 0,
          paymentStatus: ride.payment?.status || '',
        },
      }),
    ]);

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
        rideId: req.params.rideId,
        userId: req.user.id,
        cancelReason: req.body.cancelReason,
      });

    if (!ride) {
      return response.error(
        res,
        'Ride not found',
        404
      );
    }

    const driverPush = ride.driverId
      ? sendRidePushNotification({
          targetType: 'driver',
          targetId: ride.driverId.toString(),
          event: NOTIFICATION_EVENTS.RIDE_CANCELLED,
          rideId: ride._id,
          status: ride.status,
          title: 'Ride cancelled',
          body: 'The ride has been cancelled.',
          payload: {
            cancelReason: ride.cancelReason || '',
          },
        })
      : Promise.resolve();

    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: 'ride:cancelled',
        payload: {
          rideId: ride._id,
          status: ride.status,
          cancelReason: ride.cancelReason || '',
        },
      }),
      sendRidePushNotification({
        targetType: 'user',
        targetId: ride.userId.toString(),
        event: NOTIFICATION_EVENTS.RIDE_CANCELLED,
        rideId: ride._id,
        status: ride.status,
        title: 'Ride cancelled',
        body: `Ride cancelled: ${ride.cancelReason || 'No reason provided'}`,
        payload: {
          cancelReason: ride.cancelReason || '',
        },
      }),
      driverPush,
    ]);

    return response.success(
      res,
      'Ride cancelled successfully',
      ride
    );
  });
