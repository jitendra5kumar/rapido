// services/ride.service.js

import mongoose from 'mongoose';

import Ride from '../models/ride.model.js';
import User from '../models/user.model.js';

import redis from '../config/redis.js';

import {
  setDriverBusyStatus,
} from './driverLocation.service.js';

export const RIDE_STATUS = {
  SEARCHING: 'searching',
  ACCEPTED: 'accepted',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const createRide =
  async (data) => {

    const ride =
      await Ride.create({
        userId:
          data.userId,

        driverId: data.driverId || null,
        vehicleId: data.vehicleId || null,

        pickupLocation: {
          type: 'Point',

          coordinates:
            data.pickupLocation
              .coordinates,

          address:
            data.pickupLocation
              .address,

          title:
            data.pickupLocation
              .title,
        },

        dropLocation: {
          type: 'Point',

          coordinates:
            data.dropLocation
              .coordinates,

          address:
            data.dropLocation
              .address,

          title:
            data.dropLocation
              .title,
        },

        status:
          RIDE_STATUS.SEARCHING,

        payment: {
          method:
            data.payment
              ?.method,

          status:
            data.payment
              ?.status ||
            'pending',

          baseFare: Number(
            data.payment
              ?.fare || 0
          ),

          tax: Number(
            data.payment
              ?.tax || 0
          ),

          platformFee: Number(
            data.payment
              ?.platformFee || 0
          ),

          zoneCharge: Number(
            data.payment
              ?.zoneCharge || 0
          ),

          driverTip: Number(
            data.payment
              ?.driverTip || 0
          ),

          totalFare: Number(
            data.payment
              ?.totalFare || 0
          ),
        },

        requestedAt:
          new Date(),
      });

    return ride;
  };

export const getRides =
  async (filters = {}) => {

    const query = {};

    if (filters.userId) {
      query.userId =
        filters.userId;
    }

    if (filters.driverId) {
      query.driverId =
        filters.driverId;
    }

    if (filters.status) {
      query.status =
        filters.status;
    }

    return await Ride.find(query)

      .populate(
        'userId',
        'name phone'
      )

      .populate(
        'driverId',
        'name phone'
      )

      .sort({
        createdAt: -1,
      })

      .lean();
  };

export const getRideById =
  async (id) => {

    return await Ride.findById(id)

      .populate("userId", "name phone")

      .populate("driverId", "name phone")
      .populate("vehicleId", "name vehicleImage");
  };

export const updateRide =
  async (id, data) => {

    return await Ride.findByIdAndUpdate(
      id,

      {
        $set: data,
      },

      {
        new: true,
        runValidators: true,
      }
    );
  };

export const acceptRide =
  async ({
    rideId,
    driverId,
  }) => {

    const session =
      await mongoose.startSession();

    session.startTransaction();

    try {

      const driver =
        await User.findOne({
          _id: driverId,
          role: 'driver',
      
          status: 'active',
        }).session(session);

      if (!driver) {
        throw new Error(
          'Driver unavailable'
        );
      }

      if (driver.is_on_ride) {
        throw new Error(
          'Driver already on ride'
        );
      }

      // Atomic ride claim
      const ride =
        await Ride.findOneAndUpdate(

          {
            _id: rideId,
            status:
              RIDE_STATUS.SEARCHING,
          },

          {
            $set: {
              driverId,

              status:
                RIDE_STATUS.ACCEPTED,

              acceptedAt:
                new Date(),
            },
          },

          {
            new: true,
            session,
          }
        );

      if (!ride) {

        await session.abortTransaction();

        return null;
      }

      // Driver busy
      await User.updateOne(
        {
          _id: driverId,
        },

        {
          $set: {
            is_on_ride: true,
          },
        },

        {
          session,
        }
      );

      await setDriverBusyStatus(
        driverId,
        true
      );

      // Remove dispatch lock
      await redis.del(
        `driver_lock:${driverId}`
      );

      await session.commitTransaction();

      return ride;

    } catch (err) {

      await session.abortTransaction();

      throw err;

    } finally {

      session.endSession();
    }
  };

export const arriveRide =
  async ({
    rideId,
    driverId,
  }) => {
    const ride = await Ride.findOne({
      _id: rideId,
      driverId,
    });

    if (!ride) {
      throw new Error('Ride not found');
    }

    if (ride.status !== RIDE_STATUS.ACCEPTED) {
      throw new Error('Ride cannot be marked arrived');
    }

    return await Ride.findByIdAndUpdate(
      rideId,
      {
        $set: {
          status: RIDE_STATUS.ARRIVED,
          arrivedAt: new Date(),
        },
      },
      {
        new: true,
      }
    );
  };

export const startRide =
  async ({
    rideId,
    otp,
    driverId,
  }) => {

    const ride =
      await Ride.findOne({
        _id: rideId,
        driverId,
      });

    if (!ride) {
      throw new Error(
        'Ride not found'
      );
    }

    if (
      ride.status !==
      RIDE_STATUS.ACCEPTED
    ) {
      throw new Error(
        'Ride cannot start'
      );
    }

    const user =
      await User.findById(
        ride.userId
      );

    if (!user) {
      throw new Error(
        'User not found'
      );
    }

    if (
      !otp ||
      user.otp !== otp
    ) {
      throw new Error(
        'Invalid OTP'
      );
    }

    return await Ride.findByIdAndUpdate(

      rideId,

      {
        $set: {
          status:
            RIDE_STATUS.ONGOING,

          otp,

          startedAt:
            new Date(),
        },
      },

      {
        new: true,
      }
    );
  };

export const completeRide =
  async ({
    rideId,
    driverId,
  }) => {

    const ride =
      await Ride.findOne({
        _id: rideId,
        driverId,
      });

    if (!ride) {
      return null;
    }

    if (
      ride.status !==
      RIDE_STATUS.ONGOING
    ) {
      throw new Error(
        'Ride is not ongoing'
      );
    }

    const updatedRide =
      await Ride.findByIdAndUpdate(

        rideId,

        {
          $set: {
            status:
              RIDE_STATUS.COMPLETED,

            completedAt:
              new Date(),
          },
        },

        {
          new: true,
        }
      );

    // Driver free
    await Promise.all([

      User.updateOne(
        {
          _id: driverId,
        },

        {
          $set: {
            is_on_ride: false,
          },
        }
      ),

      setDriverBusyStatus(
        driverId,
        false
      ),

      redis.del(
        `driver_lock:${driverId}`
      ),
    ]);

    return updatedRide;
  };

export const cancelRide =
  async ({
    rideId,
    userId,
    cancelReason,
  }) => {

    const ride =
      await Ride.findOne({
        _id: rideId,
      });

    if (!ride) {
      return null;
    }

    if (
      [
        RIDE_STATUS.COMPLETED,
        RIDE_STATUS.CANCELLED,
      ].includes(
        ride.status
      )
    ) {
      throw new Error(
        'Ride already finished'
      );
    }

    const updatedRide =
      await Ride.findByIdAndUpdate(

        rideId,

        {
          $set: {
            status:
              RIDE_STATUS.CANCELLED,

            cancelReason,

            cancelledAt:
              new Date(),
          },
        },

        {
          new: true,
        }
      );

    // Free driver
    if (ride.driverId) {

      await Promise.all([

        User.updateOne(
          {
            _id:
              ride.driverId,
          },

          {
            $set: {
              is_on_ride: false,
            },
          }
        ),

        setDriverBusyStatus(
          ride.driverId,
          false
        ),

        redis.del(
          `driver_lock:${ride.driverId}`
        ),
      ]);
    }

    return updatedRide;
  };