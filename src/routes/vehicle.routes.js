import express from "express";

import upload from "../../uploads/upload.js";

import {
  createVehicleController,
  getVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController,
} from "../controllers/vehicle.controller.js";

import { authMiddleware, rateLimitMiddleware, requireRoles } from "../middlewares/index.js";

const router = express.Router();

/**
 * 🚗 CREATE VEHICLE (Admin only)
 */
router.post(
  "/",
  authMiddleware,
  rateLimitMiddleware,
  upload.fields([
    { name: "vehicleImage", maxCount: 1 },
    { name: "vehicleMapIcon", maxCount: 1 },
  ]),
  createVehicleController
);

/**
 * 📦 GET ALL VEHICLES (Public)
 */
router.get("/", getVehiclesController);

/**
 * 🔍 GET SINGLE VEHICLE (Public)
 */
router.get("/:id", getVehicleByIdController);

/**
 * ✏️ UPDATE VEHICLE (Admin only)
 */
router.put(
  "/:id",
  authMiddleware,
  rateLimitMiddleware,
  requireRoles('admin', 'sub_admin'),
  upload.fields([
    { name: "vehicleImage", maxCount: 1 },
    { name: "vehicleMapIcon", maxCount: 1 },
  ]),
  updateVehicleController
);

/**
 * ❌ DELETE VEHICLE (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware,
  rateLimitMiddleware,
  requireRoles('admin', 'sub_admin'),
  deleteVehicleController
);

export default router;