import express from "express";
import * as appSettingController from "../controllers/appSetting.controller.js";
import { authMiddleware, requireRoles } from "../middlewares/index.js";
import { createAppSetting as createAppSettingValidator } from "../validators/appSetting.validator.js";
import { handleValidationErrors } from "../middlewares/error.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", requireRoles("admin", "sub_admin"), appSettingController.getAppSettingsController);
router.put("/", requireRoles("admin", "sub_admin"), createAppSettingValidator, handleValidationErrors, appSettingController.upsertAppSettingsController);

export default router;