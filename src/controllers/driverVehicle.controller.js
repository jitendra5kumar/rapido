import { uploadToS3 } from "../controllers/s3.controller.js";
import { createOrUpdateVehicle, getAllVehicleDocsservice, updateVehicleStatus } from "../services/driverVehicle.service.js";
import User from "../models/user.model.js";

import { processImageUpload } from "../utils/upload.js";

export const uploadDriverVehicle = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      rcNumber,
      numberPlate,
      seatCount,
      serviceId,
      vehicleTypeId,
    } = req.body;

    const files = req.files;

    const payload = {
      rcNumber,
      numberPlate,
      seatCount,
      serviceId,
      vehicleTypeId,
    };

    // 🚀 Upload vehicle images (max 6)
    if (files?.vehicleImages?.length) {
      if (files.vehicleImages.length > 6) {
        return res.status(400).json({
          success: false,
          message: "Max 6 images allowed",
        });
      }

      const imageUrls = [];

      for (const file of files.vehicleImages) {
        const url = await processImageUpload(file, user_id);
        imageUrls.push({ url });
      }

      payload.vehicleImages = imageUrls;
    }

    const vehicle = await createOrUpdateVehicle(
      user_id,
      payload
    );

    if (vehicle) {
      await User.findByIdAndUpdate(user_id, {
        driver_id: vehicle._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle uploaded successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Vehicle Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const approveRejectVehicle = async (req, res) => {
  try {
    const { vehicle_id, status } = req.body;

    const admin_id = req.user.id; // auth middleware (admin)

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const vehicle = await updateVehicleStatus(
      vehicle_id,
      admin_id,
      status
    );

    return res.status(200).json({
      success: true,
      message: `Vehicle ${status} successfully`,
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllVehicleDocs = async (req, res) => {
  try {
    const vehicles = await getAllVehicleDocsservice();
    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};  