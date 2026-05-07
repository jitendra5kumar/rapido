import mongoose from "mongoose";

const transactionReportSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
      required: true,
      index: true,
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "wrong_amount",
        "payment_failed",
        "duplicate_charge",
        "refund_issue",
        "unauthorized",
        "other",
      ],
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending",
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    resolvedAt: {
      type: Date,
    },

    resolutionNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TransactionReport", transactionReportSchema);