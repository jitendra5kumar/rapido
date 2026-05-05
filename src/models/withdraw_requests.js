import mongoose from "mongoose";

const withdrawRequestSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed"],
      default: "pending",
      index: true,
    },

    payment_method: {
      type: String,
      enum: ["bank", "upi"],
      required: true,
    },

    // 🏦 Bank Details (optional if UPI)
    bank_details: {
      account_holder_name: String,
      account_number: String,
      ifsc_code: String,
      bank_name: String,
    },

    // 📱 UPI Details
    upi_id: {
      type: String,
    },

    message: {
      type: String, // admin note / rejection reason
    },

    processed_at: {
      type: Date,
    },

    created_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },

    deleted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Index
withdrawRequestSchema.index({ driver_id: 1, status: 1 });

export default mongoose.model("WithdrawRequest", withdrawRequestSchema);