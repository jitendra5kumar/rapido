import express from "express";
import multer from "multer";

import * as driverVehicleController from "../controllers/driverVehicle.controller.js";
import { authMiddleware, requireRoles, rateLimitMiddleware } from "../middlewares/index.js";

const router = express.Router();

// 🚀 Multer setup (memory storage for cloud upload like ImgBB/S3)
const storage = multer.memoryStorage();

// 🔐 File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
});

// 🚗 Upload Vehicle (Driver)
router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "vehicleImages", maxCount: 6 },
  ]),
  driverVehicleController.uploadDriverVehicleController
);

// 🚗 Get Vehicle (Driver)
router.get(
  "/my",
  authMiddleware,
  driverVehicleController.getDriverVehicleController
);

// 🔐 Approve / Reject Vehicle (Admin only)
router.put(
  "/status",
  authMiddleware,
  rateLimitMiddleware,
  requireRoles('admin', 'sub_admin'),
  driverVehicleController.approveRejectVehicleController
);

export default router;