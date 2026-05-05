import mongoose from "mongoose";

const vehicleTypeHourlyPackageSchema = new mongoose.Schema(
  {
    vehicle_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType",
      required: true,
      index: true,
    },

    hourly_package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HourlyPackage",
      required: true,
      index: true,
    },

    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 prevent duplicate mapping
vehicleTypeHourlyPackageSchema.index(
  { vehicle_type_id: 1, hourly_package_id: 1 },
  { unique: true }
);

export default mongoose.model(
  "VehicleTypeHourlyPackage",
  vehicleTypeHourlyPackageSchema
);