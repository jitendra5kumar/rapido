import { asyncHandler } from "../utils/index.js";
import {
  saveConfigService,
  getConfigService,
  updateSingleFieldService,
} from "../services/config.service.js";


// CREATE OR UPDATE FULL CONFIG
export const saveConfig = asyncHandler(async (req, res) => {
  try {
    const config = await saveConfigService(req.body);

    res.status(200).json({
      success: true,
      message: "Config saved successfully",
      config,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// GET CONFIG
export const getConfig = asyncHandler(async (req, res) => {
  try {
    const config = await getConfigService();

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// UPDATE SINGLE FIELD
export const updateSingleField = asyncHandler(async (req, res) => {
  try {
    const { field, value } = req.body;

    if (!field) {
      return res.status(400).json({
        success: false,
        message: "Field is required",
      });
    }

    const config = await updateSingleFieldService(field, value);

    res.status(200).json({
      success: true,
      message: `${field} updated successfully`,
      config,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});