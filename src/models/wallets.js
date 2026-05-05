import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Wallet", walletSchema);