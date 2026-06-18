import mongoose from "mongoose";
import Sequence from "./sequence.model.js";

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

    totalReferrals: {
      type: Number,
      default: 0,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    
    // ⚠️ avoid in production
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dob: {
      type: String,
    },

    profile_image_id: {
     type:String
    },

    firebase_uid: {
      type: String,
      index: true,
    },
    pin: {
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
    city:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
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
    rating: {
      type: Number,
      default: 5,
    },
    average_rating: {
      type: Number,
      default: 5,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    partnerId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    device: {
      type: String,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

// 🔥 Geo index for location search
userSchema.index({ location: "2dsphere" });

// Auto-increment `partnerId` on new User documents using the Sequence collection
userSchema.pre("save", async function (next) {
  try {
    if (this.isNew && (this.partnerId === undefined || this.partnerId === null)) {
      const seq = await Sequence.findOneAndUpdate(
        { name: "partnerId" },
        { $inc: { value: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      this.partnerId = seq.value;
    }
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", userSchema);