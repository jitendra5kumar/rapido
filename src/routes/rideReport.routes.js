import express from "express";
import * as rideReportController from "../controllers/rideReport.controller.js";
import { authMiddleware, requireRoles } from "../middlewares/index.js";
import { createRideReport as createRideReportValidator, updateReportStatus as updateReportStatusValidator, getRideReport as getRideReportValidator } from "../validators/rideReport.validator.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createRideReportValidator, handleValidationErrors, rideReportController.createRideReportController);

router.get("/", requireRoles("admin", "sub_admin"), rideReportController.getRideReportsController);

router.get("/my-reports", rideReportController.getUserRideReportsController);

router.get("/:id", getRideReportValidator, handleValidationErrors, rideReportController.getRideReportByIdController);

router.put("/:id/status", requireRoles("admin", "sub_admin"), updateReportStatusValidator, handleValidationErrors, rideReportController.updateReportStatusController);

router.delete("/:id", requireRoles("admin", "sub_admin"), rideReportController.deleteRideReportController);

export default router;