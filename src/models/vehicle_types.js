import mongoose from "mongoose";

const vehicleTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    vehicle_image_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },

    vehicle_map_icon_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },

    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    max_seat: {
      type: Number,
      default: 1,
    },

    base_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    min_per_unit_charge: {
      type: Number,
      default: 0,
    },

    max_per_unit_charge: {
      type: Number,
      default: 0,
    },

    min_per_min_charge: {
      type: Number,
      default: 0,
    },

    max_per_min_charge: {
      type: Number,
      default: 0,
    },

    min_per_weight_charge: {
      type: Number,
      default: 0,
    },

    max_per_weight_charge: {
      type: Number,
      default: 0,
    },

    cancellation_charge: {
      type: Number,
      default: 0,
    },

    waiting_time_charge: {
      type: Number,
      default: 0,
    },

    is_all_zones: {
      type: Boolean,
      default: false,
    },

    commission_type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    commission_rate: {
      type: Number,
      default: 0,
    },

    tax_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tax",
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

// 🔥 Slug auto-generate
vehicleTypeSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

// 🔥 Indexing for fast search
vehicleTypeSchema.index({ service_id: 1, status: 1 });

export default mongoose.model("VehicleType", vehicleTypeSchema);