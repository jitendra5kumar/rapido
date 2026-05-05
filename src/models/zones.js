import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 🧭 Polygon / Geo Area
    locations: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
      },
      coordinates: {
        type: [[[Number]]], // [[ [lng, lat], [lng, lat], ... ]]
        required: true,
      },
    },

    place_points: [
      {
        name: String,
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: [Number], // [lng, lat]
        },
      },
    ],

    payment_method: {
      type: [String],
      enum: ["cash", "online", "wallet"],
      default: ["cash", "online"],
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    distance_type: {
      type: String,
      enum: ["km", "mile"],
      default: "km",
    },

    currency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Geo index (important for zone detection)
zoneSchema.index({ locations: "2dsphere" });

export default mongoose.model("Zone", zoneSchema);