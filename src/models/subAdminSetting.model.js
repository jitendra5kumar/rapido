import mongoose from "mongoose";

const subAdminSettingSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    supportPhone: {
      type: String,
      trim: true,
      default: "",
    },
    contactAddress: {
      type: String,
      trim: true,
      default: "",
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
        default: "",
      },
      twitter: {
        type: String,
        trim: true,
        default: "",
      },
      instagram: {
        type: String,
        trim: true,
        default: "",
      },
      linkedin: {
        type: String,
        trim: true,
        default: "",
      },
    },
    razorpayKey: {
      type: String,
      trim: true,
      default: "",
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

export default mongoose.model("SubAdminSetting", subAdminSettingSchema);
