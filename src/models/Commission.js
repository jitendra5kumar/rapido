import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    sub_admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    commission_percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    set_by_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Commission",
  commissionSchema
);