import express from "express";
import multer from "multer";

import {
  approveRejectVehicle,
  getAllVehicleDocs,
  uploadDriverVehicle,
} from "../controllers/driverVehicle.controller.js";

import authMiddleware, { requireRoles } from "../middlewares/auth.middleware.js";
import { rateLimitMiddleware } from "../middlewares/index.js";

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
  uploadDriverVehicle
);

// 🔐 Approve / Reject Vehicle (Admin only)
router.put(
  "/status",
  authMiddleware,
  rateLimitMiddleware,
  requireRoles('admin', 'sub_admin'),
  approveRejectVehicle
);

router.get("/all",authMiddleware,rateLimitMiddleware, requireRoles('admin', 'sub_admin'),getAllVehicleDocs)

export default router;