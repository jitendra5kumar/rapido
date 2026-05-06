import ioLoader from "../config/socket.js";
import User from "../models/user.model.js";

const setupSockets = (server) => {
  const io = ioLoader(server);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // =========================
    // 🔥 DRIVER ONLINE
    // =========================
    socket.on("driver_online", async (data) => {
      try {
        const { driverId } = data;

        if (!driverId) return;

        console.log("driver_online:", driverId);


        socket.driverId = driverId;

        await User.findByIdAndUpdate(driverId, {
          is_online: true,
        });

        console.log("Driver ONLINE:", driverId);
      } catch (err) {
        console.log("driver_online error:", err.message);
      }
    });

    // =========================
    // 🔥 DRIVER OFFLINE
    // =========================
    socket.on("driver_offline", async (data) => {
      try {
        const { driverId } = data;

        if (!driverId) return;

        await User.findByIdAndUpdate(driverId, {
          is_online: false,
        });

        console.log("Driver OFFLINE:", driverId);
      } catch (err) {
        console.log("driver_offline error:", err.message);
      }
    });

    // =========================
    // 🚕 JOIN RIDE
    // =========================
    socket.on("join-ride", (rideId) => {
      socket.join(`ride-${rideId}`);
      console.log("Joined ride:", rideId);
    });

    // =========================
    // 🚕 LEAVE RIDE
    // =========================
    socket.on("leave-ride", (rideId) => {
      socket.leave(`ride-${rideId}`);
      console.log("Left ride:", rideId);
    });

    // =========================
    // 📍 DRIVER LOCATION UPDATE
    // =========================
    socket.on("driver_location", async (data) => {
      try {
        const { driverId, lat, lng } = data;

        if (!driverId || !lat || !lng) return;

        await User.findByIdAndUpdate(driverId, {
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
        });
      } catch (err) {
        console.log("location error:", err.message);
      }
    });

    // =========================
    // ❌ DISCONNECT
    // =========================
    socket.on("disconnect", async () => {
      try {
        console.log("User disconnected:", socket.id);

        if (socket.driverId) {
          await User.findByIdAndUpdate(socket.driverId, {
            is_online: false,
          });

          console.log("Auto OFFLINE:", socket.driverId);
        }
      } catch (err) {
        console.log("disconnect error:", err.message);
      }
    });

    // 🔥 DEBUG (VERY IMPORTANT)
    socket.onAny((event, data) => {
      console.log("EVENT:", event, data);
    });
  });

  return io;
};

export default setupSockets;