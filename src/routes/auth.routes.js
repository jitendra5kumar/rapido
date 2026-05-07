import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {sendOtp as sendOtpValidator, verifyOtp as verifyOtpValidator, login as loginValidator, register as registerValidator, changePassword as changePasswordValidator } from '../validators/auth.validator.js';
import {authMiddleware, rateLimitMiddleware } from '../middlewares/index.js';
import {handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.post('/send-otp', rateLimitMiddleware, sendOtpValidator, handleValidationErrors, authController.sendOtp);
router.post('/verify-otp', rateLimitMiddleware, verifyOtpValidator, handleValidationErrors, authController.verifyOtp);
router.post('/login', rateLimitMiddleware, loginValidator, handleValidationErrors, authController.login);
router.post('/register', rateLimitMiddleware, registerValidator, handleValidationErrors, authController.register);
router.post("/save-fcm-token", authMiddleware, authController.saveFcmToken);
router.post("/change-password", authMiddleware, changePasswordValidator, handleValidationErrors, authController.changePassword);

export default router;
