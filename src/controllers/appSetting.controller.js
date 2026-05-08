import * as appSettingService from "../services/appSetting.service.js";
import { asyncHandler, response } from "../utils/index.js";

// GET APP SETTINGS
export const getAppSettingsController = asyncHandler(async (req, res) => {
  const settings = await appSettingService.getAppSettings();
  response.success(res, "App settings fetched successfully", settings);
});

// UPDATE APP SETTINGS
export const upsertAppSettingsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const settings = await appSettingService.upsertAppSettings(req.body, userId);
  response.success(res, "App settings updated successfully", settings);
});