import mongoose from "mongoose";

const statusEnum = ["pending", "approved", "rejected"];

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType",
      required: true,
    },

    rcNumber: {
      type: String,
      required: true,
      trim: true,
    },

    numberPlate: {
      type: String,
      required: true,
      trim: true,
    },

    seatCount: {
      type: Number,
      required: true,
    },

    vehicleImages: [
      {
        url: String,
      },
    ],

    status: {
      type: String,
      enum: statusEnum,
      default: "pending",
    },

    isOnline: {
      type: Boolean,
      default: false, // 👈 by default offline
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

driverSchema.path("vehicleImages").validate(function (value) {
  return value.length <= 6;
}, "Maximum 6 vehicle images allowed");


driverSchema.pre("validate", async function (next) {
  try {
    const User = mongoose.model("User");

    const user = await User.findById(this.userId);

    if (!user) {
      return next(new Error("User not found"));
    }

    if (user.role !== "driver") {
      return next(new Error("Only drivers can add vehicle"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;   