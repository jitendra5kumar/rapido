import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/s3test.js";

const router = express.Router();

// Multer Memory Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

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
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Direct upload to S3
router.post(
  "/upload",
  upload.single("file"),
  uploadImage
);

export default router;