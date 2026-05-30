// sockets/index.js

import ioLoader from '../config/socket.js';

import redis from '../config/redis.js';

import {
  updateDriverLocation,
  removeDriverLocation,
  setDriverBusyStatus,
} from '../services/driverLocation.service.js';

import {
  getDriversByVehicleRoute,
} from '../services/vehicle.service.js';

import { initChatSocket } from './chat.socket.js';
import { initAdminChatSocket } from './adminChat.socket.js';

const DRIVER_HEARTBEAT_TTL = 15;

const setupSockets = (server) => {

  const io = ioLoader(server);

  // Make globally accessible
  global.io = io;

  // Initialize chat sockets
  initChatSocket(io);
  initAdminChatSocket(io);

  io.on('connection', (socket) => {

    console.log(
      `Socket connected: ${socket.id}`
    );

    // =====================================================
    // JOIN USER ROOM
    // =====================================================

    socket.on(
      'join',

      async (data = {}) => {

        try {

          const {
            userId,
            role,
          } = data;

          if (!userId) {
            return;
          }

          socket.userId =
            userId.toString();

          socket.role = role;

          // User personal room
          socket.join(
            userId.toString()
          );

          // Store socket mapping
          await redis.set(
            `socket:${userId}`,
            socket.id,
            'EX',
            86400
          );

          // DRIVER ONLINE
          if (role === 'driver') {

            socket.driverId =
              userId.toString();

            // Redis online
            await redis.sadd(
              'drivers:online',
              userId.toString()
            );

            // Heartbeat
            await redis.set(
              `driver:lastSeen:${userId}`,
              Date.now(),
              'EX',
              DRIVER_HEARTBEAT_TTL
            );

            console.log(
              `Driver online: ${userId}`
            );
          }

        } catch (err) {

          console.error(
            'join error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // HEARTBEAT
    // =====================================================

    socket.on(
      'heartbeat',

      async () => {

        try {

          if (
            !socket.driverId
          ) {
            return;
          }

          await redis.set(
            `driver:lastSeen:${socket.driverId}`,

            Date.now(),

            'EX',
            DRIVER_HEARTBEAT_TTL
          );

        } catch (err) {

          console.error(
            'heartbeat error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // DRIVER LOCATION UPDATE
    // =====================================================

    socket.on(
      'driver:location',

      async (data = {}) => {

        try {

          const {
            driverId: payloadDriverId,
            vehicleId,
            lat,
            lng,
          } = data;

          let driverId =
            socket.driverId ||
            (payloadDriverId ? payloadDriverId.toString() : null);

          if (
            !driverId ||
            lat === undefined ||
            lng === undefined
          ) {
            return;
          }

          if (!socket.driverId && payloadDriverId) {
            socket.driverId = driverId;
            socket.userId = driverId;
            socket.role = 'driver';
            socket.join(driverId);

            await redis.set(
              `socket:${driverId}`,
              socket.id,
              'EX',
              86400
            );

            await redis.sadd(
              'drivers:online',
              driverId
            );

           

            console.log(
              `Driver auto-joined from location event: ${driverId}`
            );
          }

          // Update realtime location
          await updateDriverLocation(
            driverId,
            vehicleId,
            {
              lat,
              lng,
            }
          );

          // Optional:
          // Emit live location to active rides

          if (
            socket.activeRideId
          ) {
            io.to(
              `ride:${socket.activeRideId}`
            ).emit(
              'driver:location',
              {
                driverId,
                lat,
                lng,
              }
            );
          }

        } catch (err) {

          console.error(
            'driver location error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // JOIN RIDE ROOM
    // =====================================================

    socket.on(
      'ride:join',

      async (rideId) => {

        try {

          if (!rideId) {
            return;
          }

          socket.activeRideId =
            rideId.toString();

          socket.join(
            `ride:${rideId}`
          );

          console.log(
            `Socket joined ride room ${rideId}`
          );

        } catch (err) {

          console.error(
            'ride join error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // LEAVE RIDE ROOM
    // =====================================================

    socket.on(
      'ride:leave',

      async (rideId) => {

        try {

          if (!rideId) {
            return;
          }

          socket.leave(
            `ride:${rideId}`
          );

          if (
            socket.activeRideId ===
            rideId.toString()
          ) {
            socket.activeRideId =
              null;
          }

          console.log(
            `Socket left ride room ${rideId}`
          );

        } catch (err) {

          console.error(
            'ride leave error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // DRIVER OFFLINE
    // =====================================================

    socket.on(
      'driver:offline',

      async () => {

        try {

          if (
            !socket.driverId
          ) {
            return;
          }

          await removeDriverLocation(
            socket.driverId
          );

          await redis.srem(
            'drivers:online',
            socket.driverId
          );

          await redis.del(
            `driver:lastSeen:${socket.driverId}`
          );

          console.log(
            `Driver offline: ${socket.driverId}`
          );

        } catch (err) {

          console.error(
            'driver offline error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // DRIVER BUSY STATUS
    // =====================================================

    socket.on(
      'driver:busy',

      async (busy) => {

        try {

          if (
            !socket.driverId
          ) {
            return;
          }

          await setDriverBusyStatus(
            socket.driverId,
            !!busy
          );

        } catch (err) {

          console.error(
            'driver busy error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // FIND NEARBY DRIVERS FOR ROUTE
    // =====================================================

    socket.on(
      'find-nearby-drivers',

      async (data = {}) => {

        try {

          const {
            vehicleId,
            pickup,           
            radiusMeters = 3000,
            limit = 10,
          } = data;

          if (!vehicleId) {
            socket.emit('nearby-drivers-error', {
              message: 'vehicleId is required',
            });
            return;
          }

          const result = await getDriversByVehicleRoute({
            vehicleId,
            pickup,
           
            radiusMeters,
            limit,
          });
console.log("result", result);
          socket.emit('nearby-drivers', result);

          console.log(
            `Found ${result.length} drivers for vehicle ${vehicleId}`
          );

        } catch (err) {

          console.error(
            'find nearby drivers error:',
            err.message || err
          );

          socket.emit('nearby-drivers-error', {
            message: err.message || 'Error finding nearby drivers',
          });
        }
      }
    );

    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on(
      'disconnect',

      async () => {

        try {

          console.log(
            `Socket disconnected: ${socket.id}`
          );

          if (
            socket.driverId
          ) {

            // Remove driver realtime presence
            await removeDriverLocation(
              socket.driverId
            );

            await redis.srem(
              'drivers:online',
              socket.driverId
            );

            await redis.del(
              `driver:lastSeen:${socket.driverId}`
            );

            console.log(
              `Driver auto offline: ${socket.driverId}`
            );
          }

          // Remove socket mapping
          if (
            socket.userId
          ) {
            await redis.del(
              `socket:${socket.userId}`
            );
          }

        } catch (err) {

          console.error(
            'disconnect error:',
            err.message || err
          );
        }
      }
    );

    // =====================================================
    // DEBUG
    // =====================================================

    if (
      process.env.NODE_ENV !==
      'production'
    ) {

      socket.onAny(
        (event, data) => {

          console.log(
            `Socket event: ${event}`,
            data
          );
        }
      );
    }
  });

  return io;
};

export default setupSockets;