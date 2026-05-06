import express from "express";
import multer from "multer";
import { approveRejectVehicle, uploadDriverVehicle } from "../controllers/driverVehicle.controller.js";

const router = express.Router();

// 🚀 Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload",
  upload.fields([
    { name: "vehicle_images", maxCount: 6 },
  ]),
  uploadDriverVehicle
);


router.put("/status", approveRejectVehicle);


export default router;