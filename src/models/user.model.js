import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },

    email_verified_at: {
      type: Date,
    },

    country_code: {
      type: String,
      default: "+91",
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ⚠️ avoid in production
    plain_password: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    profile_image_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },

    firebase_uid: {
      type: String,
      index: true,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    fleet_manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    referral_code: {
      type: String,
      index: true,
    },

    referred_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    created_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fcm_token: {
      type: String,
    },

    system_reserve: {
      type: Number,
      default: 0,
    },

    remember_token: {
      type: String,
    },

    deleted_at: {
      type: Date,
    },

    is_online: {
      type: Boolean,
      default: false,
    },

    is_on_ride: {
      type: Boolean,
      default: false,
    },



    role: {
      type: String,
      enum: ["rider", "driver", "admin", "sub_admin"],
      default: "rider",
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Geo index for location search
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);