import express from "express";
import * as driverReportController from "../controllers/driverReport.controller.js";
import { authMiddleware, requireRoles } from "../middlewares/index.js";
import { createDriverReport as createDriverReportValidator, updateReportStatus as updateReportStatusValidator, getDriverReport as getDriverReportValidator } from "../validators/driverReport.validator.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createDriverReportValidator, handleValidationErrors, driverReportController.createDriverReportController);

router.get("/", requireRoles("admin", "sub_admin"), driverReportController.getDriverReportsController);

router.get("/my-reports", driverReportController.getUserDriverReportsController);

router.get("/:id", getDriverReportValidator, handleValidationErrors, driverReportController.getDriverReportByIdController);

router.put("/:id/status", requireRoles("admin", "sub_admin"), updateReportStatusValidator, handleValidationErrors, driverReportController.updateDriverReportStatusController);

router.delete("/:id", requireRoles("admin", "sub_admin"), driverReportController.deleteDriverReportController);

export default router;