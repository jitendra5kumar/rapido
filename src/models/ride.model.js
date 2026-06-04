import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },

    pickupLocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
      title: String,
    },

    dropLocation: {
      type: { type: String, default: "Point", enum: ["Point"] },
      coordinates: [Number],
      address: String,
      title: String,
    },

    stops: [
      {
        type: { type: String, default: "Point", enum: ["Point"] },
        coordinates: [Number],
        address: String,
        title: String,
      },
    ],

    status: {
      type: String,
      enum: ["searching", "accepted", "arrived", "ongoing", "completed", "cancelled","search_timeout"],
      default: "searching",
      index: true,
    },

    otp: String,
    cancelReason: String,
    payment: {
      method: {
        type: String,
        enum: ["cash", "card", "upi", "wallet"],
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },

      baseFare: Number,
      tax: Number,
      platformFee: Number,
      zoneCharge: Number,
      driverTip: { type: Number, default: 0 },
      totalFare: Number,
    },

    // Estimated/recorded trip metrics
    distanceMeters: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 0 },

    requestedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    arrivedAt: Date,
  },
  { timestamps: true }
);

// 🌍 GEO index for nearby queries
rideSchema.index({ pickupLocation: "2dsphere" });

// 🔎 compound index (common queries)
rideSchema.index({ status: 1, driverId: 1 });

export default mongoose.model("Ride", rideSchema);