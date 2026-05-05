import mongoose from "mongoose";

const vehicleServiceSchema = new mongoose.Schema(
  {
    vehicle_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType",
      required: true,
      index: true,
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
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
vehicleServiceSchema.index(
  { vehicle_type_id: 1, service_id: 1 },
  { unique: true }
);

export default mongoose.model("VehicleService", vehicleServiceSchema);