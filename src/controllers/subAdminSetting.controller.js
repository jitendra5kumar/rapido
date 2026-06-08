import * as subAdminSettingService from "../services/subAdminSetting.service.js";
import { asyncHandler, response } from "../utils/index.js";

export const getSubAdminSettingController = asyncHandler(async (req, res) => {
  const setting = await subAdminSettingService.getSubAdminSetting();
  response.success(res, "Sub-admin settings fetched successfully", setting);
});

export const getSubAdminSettingByCityController = asyncHandler(async (req, res) => {
  const { city } = req.params;
  const setting = await subAdminSettingService.getSubAdminSettingByCity(city);

  if (!setting) {
    return response.error(res, "Sub-admin settings not found for city", 404);
  }

  response.success(res, "Sub-admin settings fetched successfully", setting);
});

export const createSubAdminSettingController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const setting = await subAdminSettingService.createSubAdminSetting(req.body, userId);
  response.success(res, "Sub-admin settings created successfully", setting, 201);
});

export const upsertSubAdminSettingController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const setting = await subAdminSettingService.upsertSubAdminSetting(req.body, userId);
  response.success(res, "Sub-admin settings updated successfully", setting);
});
