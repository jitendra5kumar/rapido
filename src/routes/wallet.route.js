import express from "express";
import * as walletController from "../controllers/wallet.controller.js";
import { authMiddleware, rateLimitMiddleware } from "../middlewares/index.js";

const router = express.Router();

// All wallet routes require authentication and rate limiting
router.use(authMiddleware);
router.use(rateLimitMiddleware);

/**
 * 💰 CREATE RECHARGE ORDER
 * POST /api/wallet/recharge/create-order
 */
router.post("/recharge/create-order", walletController.createRechargeOrderController);

/**
 * ✅ VERIFY PAYMENT (SUCCESS CALLBACK)
 * POST /api/wallet/recharge/verify
 */
router.post("/recharge/verify", walletController.verifyRechargePaymentController);

/**
 * ❌ PAYMENT FAILED HANDLER
 * POST /api/wallet/recharge/fail
 */
router.post("/recharge/fail", walletController.markPaymentFailedController);

export default router;