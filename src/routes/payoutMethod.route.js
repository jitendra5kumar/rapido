import express from "express";
import * as payoutMethodController from "../controllers/payoutMethod.controller.js";
import { authMiddleware } from "../middlewares/index.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET  /payout-method/my      — fetch driver's saved payout method
router.get("/my", payoutMethodController.getMyPayoutMethodController);

// PUT  /payout-method/bank    — add / update bank account
router.put("/bank", payoutMethodController.saveBankAccountController);

// PUT  /payout-method/upi     — add / update UPI ID
router.put("/upi", payoutMethodController.saveUpiIdController);

// PATCH /payout-method/active — switch active method
router.patch("/active", payoutMethodController.setActiveMethodController);

export default router;
