import mongoose from "mongoose";

const rideReportSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "wrong_fare",
        "driver_behavior",
        "vehicle_issue",
        "route_issue",
        "payment_issue",
        "other",
      ],
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resolvedAt: {
      type: Date,
    },

    resolutionNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RideReport", rideReportSchema);