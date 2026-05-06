import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    vehicle_image: String,
    vehicle_map_icon: String,

    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },

    slug: { type: String, unique: true },

    max_seat: Number,
    base_amount: Number,

    per_unit_charge: Number,

    per_min_charge: Number,

    per_weight_charge: Number,

    cancellation_charge: Number,
    waiting_time_charge: Number,

    is_all_zones: { type: Boolean, default: true },

    commission_type: { type: String, enum: ["percentage", "fixed"] },
    commission_rate: Number,


    created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    tax_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tax" },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);