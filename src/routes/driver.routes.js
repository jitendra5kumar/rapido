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

const router = express.Router();

router.post("/register",rateLimitMiddleware, sendOtpValidator, handleValidationErrors, createDriver);
router.post("/login",rateLimitMiddleware, sendOtpValidator, handleValidationErrors, loginDriver);
router.post('/send-otp', rateLimitMiddleware, sendOtpValidator, handleValidationErrors, sendOtp);
router.post('/verify-otp', rateLimitMiddleware, verifyOtpValidator, handleValidationErrors, verifyOtp);

router.get("/profile",rateLimitMiddleware, authMiddleware, getProfile);
router.put("/update-profile",rateLimitMiddleware, authMiddleware, updateProfile);
router.post("/logout", rateLimitMiddleware,authMiddleware, logout);

export default router;