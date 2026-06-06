// controllers/ride.controller.js

import * as rideService from '../services/ride.service.js';
import User from '../models/user.model.js';
import redis, {
  RIDE_REQUESTS_STREAM,
  DRIVERS_GEO_KEY,
  DISPATCH_CONSUMER_GROUP,
} from '../config/redis.js';

import {
  asyncHandler,
  response,
} from '../utils/index.js';
import { emitRideEvent } from '../helpers/realtime.helper.js';
import { sendRidePushNotification } from '../helpers/notification.helper.js';
import { NOTIFICATION_EVENTS } from '../utils/constants.js';
import Driver from '../models/driver.model.js';
import Vehicle from '../models/vehicle.model.js';

const calculateRideFare = (distanceKm, vehicle) => {
  const baseAmount = Number((vehicle?.baseAmount ?? vehicle?.fare ?? 0) || 0);
  const perUnitCharge = Number(vehicle?.perUnitCharge ?? 0);
  const hasBaseAmount = !Number.isNaN(baseAmount) && baseAmount > 0;
  const hasPerUnitCharge = !Number.isNaN(perUnitCharge) && perUnitCharge > 0;

  let calculatedFare = hasBaseAmount ? baseAmount : undefined;

  if (hasPerUnitCharge) {
    const distanceFare = Math.round(distanceKm * perUnitCharge);
    calculatedFare = distanceKm > 3 ? distanceFare : baseAmount;
  }

  if (!hasBaseAmount && hasPerUnitCharge) {
    calculatedFare = Math.round(distanceKm * perUnitCharge);
  }

  if (!Number.isFinite(calculatedFare) || calculatedFare <= 0) {
    calculatedFare = Math.round(distanceKm * (vehicle?.multiplier ?? 1));
  }

  return calculatedFare;
};

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

const parseStreamFields = (fields) => {
  const result = {};

  for (let i = 0; i < fields.length; i += 2) {
    result[fields[i]] = fields[i + 1];
  }

  return result;
};

const removeRideRequestStreamEntries = async (rideId) => {
  if (!rideId) {
    return;
  }

  try {
    let lastId = '-';
    const streamIdsToRemove = [];

    while (true) {
      const entries = await redis.xrange(
        RIDE_REQUESTS_STREAM,
        lastId,
        '+',
        'COUNT',
        1000
      );

      if (!entries || !entries.length) {
        break;
      }

      for (const [streamId, fields] of entries) {
        const message = parseStreamFields(fields);

        if (message.rideId === rideId.toString()) {
          streamIdsToRemove.push(streamId);
        }
      }

      if (entries.length < 1000) {
        break;
      }

      lastId = `(${entries[entries.length - 1][0]}`;
    }

    if (!streamIdsToRemove.length) {
      return;
    }

    await redis.xack(
      RIDE_REQUESTS_STREAM,
      DISPATCH_CONSUMER_GROUP,
      ...streamIdsToRemove
    );

    await redis.xdel(
      RIDE_REQUESTS_STREAM,
      ...streamIdsToRemove
    );

    console.log(
      `Removed ride ${rideId} from ${RIDE_REQUESTS_STREAM}`,
      streamIdsToRemove
    );
  } catch (err) {
    console.error(
      'remove ride request stream entries error:',
      err.message || err
    );
  }
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
        status: req.query.status,
        limit: req.query.limit,
      });

    return response.success(
      res,
      'Your rides fetched successfully',
      rides
    );
  });

export const getRecentRides =
  asyncHandler(async (req, res) => {
    const rides =
      await rideService.getRecentUserRides({
        userId: req.user.id,
        limit: 10,
      });

    return response.success(
      res,
      'Your recent rides fetched successfully',
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
    const driverId = await User.findById(req.user.id)
      .select("_id name phone")
      .lean();
   
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

    // Fetch driver location from Redis geospatial data
    const driverLocationData = await redis.geopos(
      DRIVERS_GEO_KEY,
      req.user.id.toString(),
    );

    const driverLocation = driverLocationData?.[0]
      ? {
          longitude: parseFloat(driverLocationData[0][0]),
          latitude: parseFloat(driverLocationData[0][1]),
        }
      : null;

    await Promise.allSettled([
      emitRideEvent({
        targetType: "user",
        targetId: ride.userId.toString(),
        event: "ride:accepted",
        payload: {
          rideId: ride._id,
          driverId: ride.driverId,
          status: ride.status,
          driverLocation,
        },
      }),
      sendRidePushNotification({
        targetType: "user",
        targetId: ride.userId.toString(),
        event: NOTIFICATION_EVENTS.RIDE_ACCEPTED,
        rideId: ride._id,
        status: ride.status,
        title: "Driver accepted your ride",
        body: `${driverId?.name || "Your driver"} is on the way.`,
        payload: {
          driverName: driverId?.name || "",
          driverPhone: driverId?.phone || "",
        },
      }),
    ]);

    try {
      const driverSocketId = await redis.get(
        `socket:${ride.driverId.toString()}`
      );

      if (
        driverSocketId &&
        global.io?.sockets?.sockets?.get
      ) {
        const driverSocket = global.io.sockets.sockets.get(
          driverSocketId
        );

        if (driverSocket) {
          driverSocket.activeRideId = ride._id.toString();
          driverSocket.join(`ride:${ride._id.toString()}`);

          console.log(
            `Driver socket ${ride.driverId.toString()} joined ride:${ride._id.toString()}`
          );
        }
      }
    } catch (err) {
      console.error(
        'ride accept socket bind error:',
        err.message || err
      );
    }

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
        otp: req.body.otp,
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

    await removeRideRequestStreamEntries(ride._id);

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

    // await removeRideRequestStreamEntries(ride._id);

    return response.success(
      res,
      'Ride cancelled successfully',
      ride
    );
  });

export const updateDropLocation =
  asyncHandler(async (req, res) => {
    const rideId = req.params.rideId;

    const ride = await rideService.getRideById(rideId);

    if (!ride) {
      return response.error(res, 'Ride not found', 404);
    }

    // Only ride owner or admin/sub_admin can change drop location
    const requesterId = req.user?.id?.toString();
    const rideUserId = ride.userId?._id
      ? ride.userId._id.toString()
      : ride.userId?.toString();

    if (
      !requesterId ||
      (req.user.role !== 'admin' && req.user.role !== 'sub_admin' && requesterId !== rideUserId)
    ) {
      return response.error(res, 'Unauthorized', 403);
    }

    const {
      address,
      latitude,
      longitude,
      title,
      distanceMeters,
      durationMinutes,
    } = req.body;

   

    if (!address || latitude === undefined || longitude === undefined) {
      return response.error(res, 'Invalid drop location', 400);
    }

    const parsedLongitude = Number(longitude);
    const parsedLatitude = Number(latitude);

    if (Number.isNaN(parsedLongitude) || Number.isNaN(parsedLatitude)) {
      return response.error(res, 'Invalid drop coordinates', 400);
    }

    const updatedFields = {
      dropLocation: {
        type: 'Point',
        coordinates: [parsedLongitude, parsedLatitude],
        address: address || '',
        title: title || '',
      },
    };

    if (distanceMeters !== undefined) {
      updatedFields.distanceMeters = Number(distanceMeters);
    }
    if (durationMinutes !== undefined) {
      updatedFields.durationMinutes = Number(durationMinutes);
    }

    const vehicleId = ride.vehicleId?._id ? ride.vehicleId._id : ride.vehicleId;
    const vehicle = vehicleId
      ? ride.vehicleId && typeof ride.vehicleId === 'object' && ride.vehicleId.baseAmount !== undefined
        ? ride.vehicleId
        : await Vehicle.findById(vehicleId).lean()
      : null;

    if (vehicle) {
      const rideDistance = Number(updatedFields.distanceMeters ?? ride.distanceMeters ?? 0);
      const distanceKm = Math.max(0, rideDistance / 1000);
      const calculatedFare = calculateRideFare(distanceKm, vehicle);

      updatedFields.payment = {
        ...(ride.payment || {}),
        fare: calculatedFare,
        totalFare: calculatedFare,
      };
    }

    const updatedRide = await rideService.updateRide(rideId, updatedFields);

    const payload = {
      rideId: updatedRide._id,
      dropLocation: updatedRide.dropLocation,
      payment: updatedRide.payment,
    };

    // Notify user and driver via personal rooms
    await Promise.allSettled([
      emitRideEvent({
        targetType: 'user',
        targetId: updatedRide.userId?.toString() || rideUserId,
        event: 'ride:drop_location:changed',
        payload,
      }),
      updatedRide.driverId
        ? emitRideEvent({
            targetType: 'driver',
            targetId: updatedRide.driverId.toString(),
            event: 'ride:drop_location:changed',
            payload,
          })
        : Promise.resolve(),
    ]);

    // Also broadcast to any sockets joined to the ride room
    try {
      if (global.io) {
        global.io.to(`ride:${rideId}`).emit('ride:drop_location:changed', payload);
      }
    } catch (err) {
      console.error('ride room emit error:', err.message || err);
    }

    return response.success(res, 'Drop location updated', updatedRide);
  });
