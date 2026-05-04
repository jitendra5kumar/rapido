const express = require('express');
const authController = require('../controllers/auth.controller');
const { sendOtp: sendOtpValidator, verifyOtp: verifyOtpValidator, login: loginValidator } = require('../validators/auth.validator');
const { rateLimitMiddleware } = require('../middlewares');
const { handleValidationErrors } = require('../middlewares/error.middleware');

const router = express.Router();

router.post('/send-otp', rateLimitMiddleware, sendOtpValidator, handleValidationErrors, authController.sendOtp);
router.post('/verify-otp', rateLimitMiddleware, verifyOtpValidator, handleValidationErrors, authController.verifyOtp);
router.post('/login', rateLimitMiddleware, loginValidator, handleValidationErrors, authController.login);

module.exports = router;