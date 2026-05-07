import express from "express";
import multer from "multer";

import {
  updateDocumentStatusController,
  uploadDriverDocuments,
} from "../controllers/driverDocument.controller.js";

import authMiddleware, { requireRoles } from "../middlewares/auth.middleware.js";
import { rateLimitMiddleware } from "../middlewares/index.js";

const router = express.Router();

// 🚀 Multer setup (memory storage for ImgBB)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

// 📤 Upload Driver Documents (SECURED)
router.post(
  "/upload",
  authMiddleware,
  upload.fields([
    { name: "aadhaar_front", maxCount: 1 },
    { name: "aadhaar_back", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "dl", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
  ]),
  uploadDriverDocuments
);

// 🔐 Approve / Reject Document Status (Admin only)
router.patch(
  "/:id/status",
  authMiddleware,
  rateLimitMiddleware,
  requireRoles('admin', 'sub_admin'),
  updateDocumentStatusController
);

export default router;