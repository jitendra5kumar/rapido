import express from "express";
import upload from "../../uploads/upload.js";

import {
  createVehicleController,
  getVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController,
} from "../controllers/vehicle.controller.js";

const router = express.Router();

/**
 * CREATE VEHICLE
 */
router.post(
  "/create",
  upload.fields([
    { name: "vehicle_image", maxCount: 1 },
    { name: "vehicle_map_icon", maxCount: 1 },
  ]),
  createVehicleController
);

/**
 * GET ALL VEHICLES
 */
router.get("/", getVehiclesController);

/**
 * GET SINGLE VEHICLE
 */
router.get("/:id", getVehicleByIdController);

/**
 * UPDATE VEHICLE
 */
router.put(
  "/:id",
  upload.fields([
    { name: "vehicle_image", maxCount: 1 },
    { name: "vehicle_map_icon", maxCount: 1 },
  ]),
  updateVehicleController
);

/**
 * DELETE VEHICLE
 */
router.delete("/:id", deleteVehicleController);

export default router;