import express from "express";

import {
  setPlatformPercent,
  setSubAdminCommission,
  getSubAdminCommission,
} from "../controllers/commissionController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";


const router = express.Router();

// =====================================
// SET PLATFORM PERCENT
// =====================================

router.post(
  "/set-platform-percent",
  authMiddleware,
  handleValidationErrors,
  setPlatformPercent
);

// =====================================
// SET SUB ADMIN COMMISSION
// =====================================

router.post(
  "/set-subadmin-commission",
  authMiddleware,
  handleValidationErrors,
  setSubAdminCommission
);

// =====================================
// GET ALL COMMISSIONS
// =====================================

router.get(
  "/all",
  authMiddleware,
  handleValidationErrors,
  getSubAdminCommission
);

export default router;