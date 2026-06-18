import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {sendOtp as sendOtpValidator, verifyOtp as verifyOtpValidator, completeProfile as completeProfileValidator, changePassword as changePasswordValidator, adminRegister as adminRegisterValidator, adminLogin as adminLoginValidator } from '../validators/auth.validator.js';
import {authMiddleware, rateLimitMiddleware } from '../middlewares/index.js';
import {handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.post('/send-otp', rateLimitMiddleware, sendOtpValidator, handleValidationErrors, authController.sendOtp);
router.post('/verify-otp', rateLimitMiddleware, verifyOtpValidator, handleValidationErrors, authController.verifyOtp);
router.post('/complete-profile', rateLimitMiddleware, completeProfileValidator, handleValidationErrors, authController.completeProfile);
//  admin auth routes
router.post('/admin/register', rateLimitMiddleware, adminRegisterValidator, handleValidationErrors, authController.adminRegister);
router.post('/admin/login', rateLimitMiddleware, adminLoginValidator, handleValidationErrors, authController.adminLogin);
router.post('/logout', authMiddleware, authController.logout);
router.post("/save-fcm-token", authMiddleware, authController.saveFcmToken);
router.post("/change-password", authMiddleware, changePasswordValidator, handleValidationErrors, authController.changePassword);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

export default router;
