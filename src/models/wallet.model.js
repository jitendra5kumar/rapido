import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user = 1 wallet
      index: true
    },

    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    totalCommission: {
      type: Number,
      default: 0,
      min: 0
    },

    adminCommission: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Wallet", walletSchema);