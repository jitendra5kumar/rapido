import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import {sendOtp as sendOtpValidator, verifyOtp as verifyOtpValidator, login as loginValidator } from '../validators/auth.validator.js';
import {rateLimitMiddleware } from '../middlewares/index.js';
import {handleValidationErrors } from '../middlewares/error.middleware.js';

const router = express.Router();

router.post('/send-otp', rateLimitMiddleware, sendOtpValidator, handleValidationErrors, authController.sendOtp);
router.post('/verify-otp', rateLimitMiddleware, verifyOtpValidator, handleValidationErrors, authController.verifyOtp);
router.post('/login', rateLimitMiddleware, loginValidator, handleValidationErrors, authController.login);

export default router;
