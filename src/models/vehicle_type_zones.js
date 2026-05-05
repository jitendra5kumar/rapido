import mongoose from "mongoose";

const vehicleTypeZoneSchema = new mongoose.Schema(
  {
    vehicle_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType",
      required: true,
      index: true,
    },

    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 prevent duplicate mapping
vehicleTypeZoneSchema.index(
  { vehicle_type_id: 1, zone_id: 1 },
  { unique: true }
);

export default mongoose.model("VehicleTypeZone", vehicleTypeZoneSchema);