import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema(
  {
    firstRideDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minWithdraw: {
      type: Number,
      default: 0,
      min: 0,
    },
    driverMinWallet: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AppSetting", appSettingSchema);