import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
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


    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: false,
    },

    // ⚠️ avoid in production


    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    profile_image_id: {
     type:String
    },

    firebase_uid: {
      type: String,
      index: true,
    },
    otp: {
      type: String,
    
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

    driver_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",

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
    wallet: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);

// 🔥 Geo index for location search
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);