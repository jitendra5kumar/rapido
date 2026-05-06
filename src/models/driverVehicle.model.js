import mongoose from "mongoose";

const statusEnum = ["pending", "approved", "rejected"];

const driverVehicleSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    rc_number: {
      type: String,
      required: true,
      trim: true,
    },

    number_plate: {
      type: String,
      required: true,
      trim: true,
    },

    seat_count: {
      type: Number,
      required: true,
    },

    vehicle_images: [
      {
        url: String,
      },
    ],

    status: {
      type: String,
      enum: statusEnum,
      default: "pending",
    },

    is_online: {
      type: Boolean,
      default: false, // 👈 by default offline
    },

    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

driverVehicleSchema.path("vehicle_images").validate(function (value) {
  return value.length <= 6;
}, "Maximum 6 vehicle images allowed");


driverVehicleSchema.pre("validate", async function (next) {
  try {
    const User = mongoose.model("User");

    const user = await User.findById(this.user_id);

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

const DriverVehicle = mongoose.model("DriverVehicle", driverVehicleSchema);

export default DriverVehicle;   