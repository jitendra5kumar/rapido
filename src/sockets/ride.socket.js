import Ride from "../models/ride.model.js";

export const initRideSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Ride socket connected:", socket.id);

    // Join ride room
    socket.on("join_ride", (data) => {
      const { rideId, userId, role } = data;
      const roomName = `ride_${rideId}`;

      socket.join(roomName);
      console.log(`${role} ${userId} joined ride room: ${roomName}`);

      socket.to(roomName).emit("user_joined_ride", {
        userId,
        role,
        timestamp: new Date(),
      });
    });

    // Update extra increase fare
    socket.on("update_extra_fare", async (data) => {
      try {
        const { rideId, extraIncreaseFare, userId } = data;
        const roomName = `ride_${rideId}`;

        if (!rideId || extraIncreaseFare === undefined) {
          socket.emit("error", {
            message: "rideId and extraIncreaseFare are required",
          });
          return;
        }

        // Update ride with extra fare
        const ride = await Ride.findById(rideId);

        if (!ride) {
          socket.emit("error", {
            message: "Ride not found",
          });
          return;
        }

        // Update extra increase fare
        ride.payment.extraIncreaseFare = Number(extraIncreaseFare);

        // Recalculate total fare
        const totalFare =
          (ride.payment.fare || 0) +
          (ride.payment.tax || 0) +
          (ride.payment.platformFee || 0) +
          (ride.payment.zoneCharge || 0) +
          (ride.payment.driverTip || 0) +
          (ride.payment.extraIncreaseFare || 0);

        ride.payment.totalFare = totalFare;

        await ride.save();

        console.log(
          `Extra fare updated for ride ${rideId}: ${extraIncreaseFare}, Total fare: ${totalFare}`
        );

        // Emit to all users in the ride room
        io.to(roomName).emit("extra_fare_updated", {
          rideId,
          extraIncreaseFare: ride.payment.extraIncreaseFare,
          totalFare: ride.payment.totalFare,
          updatedBy: userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating extra fare:", error);
        socket.emit("error", {
          message: "Failed to update extra fare",
          error: error.message,
        });
      }
    });

    // Get current ride data
    socket.on("get_ride_data", async (data) => {
      try {
        const { rideId } = data;

        const ride = await Ride.findById(rideId);

        if (!ride) {
          socket.emit("error", {
            message: "Ride not found",
          });
          return;
        }

        socket.emit("ride_data", {
          rideId,
          payment: ride.payment,
          status: ride.status,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error fetching ride data:", error);
        socket.emit("error", {
          message: "Failed to fetch ride data",
        });
      }
    });

    // Leave ride room
    socket.on("leave_ride", (data) => {
      const { rideId, userId } = data;
      const roomName = `ride_${rideId}`;

      socket.leave(roomName);
      console.log(`User ${userId} left ride room: ${roomName}`);

      socket.to(roomName).emit("user_left_ride", {
        userId,
        timestamp: new Date(),
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Ride socket disconnected:", socket.id);
    });
  });
};
