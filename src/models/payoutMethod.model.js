import mongoose from "mongoose";

const payoutMethodSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ── Bank Account ────────────────────────────────────────────────────────
    bank: {
      holderName:    { type: String, trim: true, default: "" },
      bankName:      { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifscCode:      { type: String, trim: true, uppercase: true, default: "" },
    },

    // ── UPI ─────────────────────────────────────────────────────────────────
    upi: {
      vpa: { type: String, trim: true, lowercase: true, default: "" }, // e.g. name@upi
    },

    // ── Active Method ────────────────────────────────────────────────────────
    activeMethod: {
      type: String,
      enum: ["bank", "upi", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

const PayoutMethod = mongoose.model("PayoutMethod", payoutMethodSchema);

export default PayoutMethod;
