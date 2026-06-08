import express from "express";
import * as subAdminSettingController from "../controllers/subAdminSetting.controller.js";
import { authMiddleware, requireRoles } from "../middlewares/index.js";
import {
  createSubAdminSetting as createSubAdminSettingValidator,
  getSubAdminSettingByCity as getSubAdminSettingByCityValidator,
} from "../validators/subAdminSetting.validator.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  requireRoles("admin", "sub_admin"),
  subAdminSettingController.getSubAdminSettingController
);
router.get(
  "/city/:city",
  
  getSubAdminSettingByCityValidator,
  handleValidationErrors,
  subAdminSettingController.getSubAdminSettingByCityController
);
router.post(
  "/",
  requireRoles("admin", "sub_admin"),
  createSubAdminSettingValidator,
  handleValidationErrors,
  subAdminSettingController.createSubAdminSettingController
);
router.put(
  "/",
  requireRoles("admin", "sub_admin"),
  createSubAdminSettingValidator,
  handleValidationErrors,
  subAdminSettingController.upsertSubAdminSettingController
);

export default router;
