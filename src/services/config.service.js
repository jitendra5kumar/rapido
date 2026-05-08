import Config from "../models/config.model.js";


// CREATE OR UPDATE CONFIG
export const saveConfigService = async (data) => {
  let config = await Config.findOne();

  if (config) {
    config = await Config.findByIdAndUpdate(
      config._id,
      { $set: data },
      { new: true }
    );
  } else {
    config = await Config.create(data);
  }

  return config;
};


// GET CONFIG
export const getConfigService = async () => {
  return await Config.findOne();
};


// UPDATE SINGLE FIELD
export const updateSingleFieldService = async (field, value) => {
  let config = await Config.findOne();

  if (!config) {
    config = await Config.create({
      [field]: value,
    });
  } else {
    config = await Config.findByIdAndUpdate(
      config._id,
      {
        $set: {
          [field]: value,
        },
      },
      { new: true }
    );
  }

  return config;
};