import SubAdminSetting from "../models/subAdminSetting.model.js";

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getSubAdminSetting = async () => {
  return await SubAdminSetting.findOne().sort({ createdAt: -1 });
};

export const getSubAdminSettingByCity = async (city) => {
  const cityPattern = new RegExp(`^${escapeRegex(city)}$`, "i");
  return await SubAdminSetting.findOne({ city: cityPattern });
};

export const createSubAdminSetting = async (data, userId) => {
  const setting = new SubAdminSetting({
    ...data,
    createdById: userId,
    updatedById: userId,
  });

  return await setting.save();
};

export const upsertSubAdminSetting = async (data, userId) => {
  const updateData = {
    ...data,
    updatedById: userId,
  };

  const options = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  };

  const setting = await SubAdminSetting.findOneAndUpdate({}, updateData, options);

  if (!setting.createdById) {
    setting.createdById = userId;
    await setting.save();
  }

  return setting;
};
