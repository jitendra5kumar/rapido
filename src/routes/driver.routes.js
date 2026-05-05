import express from "express";
import {
  createDriver,
  loginDriver,
  getProfile,
  updateProfile,
  logout,
} from "../controllers/driver.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", createDriver);
router.post("/login", loginDriver);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/logout", authMiddleware, logout);

export default router;