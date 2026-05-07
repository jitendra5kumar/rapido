import express from "express";
import * as transactionReportController from "../controllers/transactionReport.controller.js";
import { authMiddleware, requireRoles } from "../middlewares/index.js";
import { createTransactionReport as createTransactionReportValidator, updateReportStatus as updateReportStatusValidator, getTransactionReport as getTransactionReportValidator } from "../validators/transactionReport.validator.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTransactionReportValidator, handleValidationErrors, transactionReportController.createTransactionReportController);

router.get("/", requireRoles("admin", "sub_admin"), transactionReportController.getTransactionReportsController);

router.get("/my-reports", transactionReportController.getUserTransactionReportsController);

router.get("/:id", getTransactionReportValidator, handleValidationErrors, transactionReportController.getTransactionReportByIdController);

router.put("/:id/status", requireRoles("admin", "sub_admin"), updateReportStatusValidator, handleValidationErrors, transactionReportController.updateTransactionReportStatusController);

router.delete("/:id", requireRoles("admin", "sub_admin"), transactionReportController.deleteTransactionReportController);

export default router;