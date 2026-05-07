import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpay_order_id: {
      type: String,
    },

    razorpay_payment_id: {
      type: String,
    },

    razorpay_signature: {
      type: String,
    },

    status: {
      type: String,
      enum: ["created", "success", "failed"],
      default: "created",
    },

    payment_method: {
      type: String,
      default: "razorpay",
    },

    type: {
      type: String,
      enum: ["recharge", "withdraw"],
      default: "recharge",
    },

    failure_reason: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WalletTransaction", walletTransactionSchema);