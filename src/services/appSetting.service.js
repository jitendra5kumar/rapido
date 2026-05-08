import AppSetting from "../models/appSetting.model.js";

export const getAppSettings = async () => {
  return await AppSetting.findOne().sort({ createdAt: -1 });
};

export const upsertAppSettings = async (data, userId) => {
  const updateData = {
    ...data,
    updatedById: userId,
  };

  const options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  };

  const settings = await AppSetting.findOneAndUpdate({}, updateData, options);

  if (!settings.createdById) {
    settings.createdById = userId;
    await settings.save();
  }

  return settings;
};