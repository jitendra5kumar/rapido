import { razorpay } from "../config/razorpay.js";
import WalletTransaction from "../models/walletTransaction.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

// =============================
// CREATE ORDER SERVICE
// =============================
export const createRechargeOrderService = async (user_id, amount) => {
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  const transaction = await WalletTransaction.create({
    user_id,
    amount,
    razorpay_order_id: order.id,
    status: "created",
  });

  return { order, transaction };
};

// =============================
// VERIFY PAYMENT SERVICE
// =============================
export const verifyPaymentService = async (data) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = data;

  const transaction = await WalletTransaction.findOne({
    razorpay_order_id,
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    transaction.status = "failed";
    transaction.failure_reason = "Signature mismatch";
    await transaction.save();

    throw new Error("Payment verification failed");
  }

  // success
  transaction.status = "success";
  transaction.razorpay_payment_id = razorpay_payment_id;
  transaction.razorpay_signature = razorpay_signature;
  await transaction.save();

  // wallet update
  await User.findByIdAndUpdate(transaction.user_id, {
    $inc: { wallet: transaction.amount },
  });

  return transaction;
};

// =============================
// MARK FAILED SERVICE
// =============================
export const markFailedService = async (order_id, reason) => {
  const tx = await WalletTransaction.findOneAndUpdate(
    { razorpay_order_id: order_id },
    {
      status: "failed",
      failure_reason: reason || "Payment failed",
    },
    { new: true }
  );

  return tx;
};