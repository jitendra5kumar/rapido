import * as driverService from "../services/driver.service.js";
import * as authService from "../services/auth.service.js";
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';
export const createDriver = asyncHandler(async (req, res) => {
    try {
        const data = await driverService.createDriverService(req.body);

        res.status(201).json({
            message: "Driver created",
            data,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone, driver = 6, channel = "sms" } = req.body;
  await authService.sendOtp(phone, driver, channel);
  response.success(res, "OTP sent successfully");
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp(phone, otp);
    response.success(res, 'OTP verified and logged in', result);
});



export const loginDriver = asyncHandler(async (req, res) => {
    try {
        const data = await driverService.loginDriverService(req.body);

        res.json({
            message: "Login successful",
            ...data,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export const getProfile = asyncHandler(async (req, res) => {
    try {
        const data = await driverService.getProfileService(req.user.id);

        res.json({
            message: "Profile fetched",
            data,
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

export const updateProfile = asyncHandler(async (req, res) => {
    try {
        const data = await driverService.updateProfileService(
            req.user.id,
            req.body
        );

        res.json({
            message: "Profile updated",
            data,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export const logout = asyncHandler(async (req, res) => {
    try {
        await driverService.logoutService(req.user.id);

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});