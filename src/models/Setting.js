import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    platform_percent: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Setting",
  settingSchema
);