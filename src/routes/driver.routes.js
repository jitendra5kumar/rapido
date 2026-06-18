import express from "express";
import {
  createDriver,
  loginDriver,
  getProfile,
  updateProfile,
  logout,
  sendOtp,
  verifyOtp,
} from "../controllers/driver.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import rateLimitMiddleware from "../middlewares/rateLimit.middleware.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

// ✅ validators (MISSING FIX)
import {sendOtp as sendOtpValidator, verifyOtp2 as verifyOtpValidator, login as loginValidator, register as registerValidator } from '../validators/auth.validator.js';


const router = express.Router();


// ================= OTP FLOW =================
router.post(
  "/send-otp",
  rateLimitMiddleware,
  sendOtpValidator,
  handleValidationErrors,
  sendOtp
);

router.post(
  "/verify-otp",
  rateLimitMiddleware,
  verifyOtpValidator,
  handleValidationErrors,
  verifyOtp
);


// ================= AUTH FLOW =================
router.post(
  "/register",
  rateLimitMiddleware,
  registerValidator,
  handleValidationErrors,
  createDriver
);

router.post(
  "/login",
  rateLimitMiddleware,
  loginValidator,
  handleValidationErrors,
  loginDriver
);


// ================= PROFILE =================
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.put(
  "/update-profile",
  authMiddleware,   // ✅ FIXED SECURITY
  updateProfile
);

router.put(
  "/updateProfile",
  authMiddleware,
  updateProfile
);


// ================= LOGOUT =================
router.post(
  "/logout",
  authMiddleware,
  logout
);

export default router;