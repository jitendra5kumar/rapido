import express from "express";
import multer from "multer";
import { uploadDriverDocuments } from "../controllers/driverDocument.controller.js";

const router = express.Router();

// 🚀 Multer setup (memory storage for ImgBB)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📤 Upload Route
router.post(
  "/upload",
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

export default router;