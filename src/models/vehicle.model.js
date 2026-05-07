import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    vehicleImage: String,
    vehicleMapIcon: String,

    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },

    slug: { type: String, unique: true },

    maxSeat: Number,
    baseAmount: Number,

    perUnitCharge: Number,

    perMinuteCharge: Number,

    perWeightCharge: Number,

    cancellationCharge: Number,
    waitingTimeCharge: Number,

    isAllZones: { type: Boolean, default: true },

    commissionType: { type: String, enum: ["percentage", "fixed"] },
    commissionRate: Number,


    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    taxId: { type: mongoose.Schema.Types.ObjectId, ref: "Tax" },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("VehicleType", vehicleSchema);