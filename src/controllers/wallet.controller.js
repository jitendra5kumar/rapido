import * as walletService from "../services/wallet.service.js";
import { asyncHandler, response } from "../utils/index.js";

// =============================
// CREATE RECHARGE ORDER
// =============================
export const createRechargeOrderController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return response.error(res, "Invalid amount", 400);
  }

  const result = await walletService.createRechargeOrder(userId, amount);

  response.success(res, "Order created successfully", result, 201);
});

// =============================
// VERIFY RECHARGE PAYMENT
// =============================
export const verifyRechargePaymentController = asyncHandler(async (req, res) => {
  const result = await walletService.verifyRechargePayment(req.body);

  response.success(res, "Payment verified & wallet updated", result);
});

// =============================
// FAILED PAYMENT
// =============================
export const markPaymentFailedController = asyncHandler(async (req, res) => {
  const { razorpay_order_id, reason } = req.body;

  if (!razorpay_order_id) {
    return response.error(res, "razorpay_order_id is required", 400);
  }

  const result = await walletService.markPaymentFailed(razorpay_order_id, reason);

  response.success(res, "Payment marked failed", result);
});