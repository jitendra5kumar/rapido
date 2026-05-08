import mongoose from "mongoose";

const vehicleCustomSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType", // vehicle category (e.g., Sedan, SUV)
      required: true,
      index: true
    },

    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },

    chargePerKm: {
      type: Number,
      required: true,
      min: 0
    },
// waiting charge per minute
    chargePerMinute: {
      type: Number,
      required: true,
      min: 0
    },

    cancellationCharge: {
      type: Number,
      required: true,
      min: 0
    },

    commissionType: {
      type: String,
      enum: ["percentage", "fixed"], // best practice
      required: true
    },

    commissionRate: {
      type: Number,
      required: true,
      min: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
vehicleCustomSchema.index({ categoryId: 1 }, { unique: true });
export default mongoose.model("VehicleCustom", vehicleCustomSchema);

vehicleCustomSchema.pre("save", function (next) {
  if (this.commissionType === "percentage" && this.commissionRate > 100) {
    return next(new Error("Percentage commission cannot exceed 100"));
  }
  next();
});