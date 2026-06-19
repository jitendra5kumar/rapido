import express from "express";

import {
  createRechargeOrder,
  verifyRechargePayment,
  markPaymentFailed,
} from "../controllers/wallet.controller.js";

import { authMiddleware, rateLimitMiddleware } from "../middlewares/index.js";

const router = express.Router();

/**
 * 💰 CREATE RECHARGE ORDER
 */
router.post(
  "/recharge/create-order",
  authMiddleware,
  rateLimitMiddleware,
  createRechargeOrder
);

/**
 * ✅ VERIFY PAYMENT (SUCCESS CALLBACK)
 */
router.post(
  "/recharge/verify",
  authMiddleware,
  rateLimitMiddleware,
  verifyRechargePayment
);

/**
 * ❌ PAYMENT FAILED HANDLER
 */
router.post(
  "/recharge/fail",
  authMiddleware,
  rateLimitMiddleware,
  markPaymentFailed
);

export default router;