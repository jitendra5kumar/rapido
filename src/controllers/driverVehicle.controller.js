import { uploadToImgBB } from "../services/imgbb.service.js";
import { createOrUpdateVehicle, updateVehicleStatus } from "../services/driverVehicle.service.js";
import User from "../models/user.model.js";

export const uploadDriverVehicle = async (req, res) => {
  try {
    const user_id = req.user.id; // auth middleware required

    const { numberPlate, vehicleName, seatCount, serviceId, vehicleTypeId } = req.body;

    const files = req.files;

    let payload = {
      numberPlate,
      vehicleName,
      seatCount,
      serviceId,
      vehicleTypeId,
    };

    // 🚀 Upload vehicle images (max 6)
    if (files?.vehicleImages) {
      if (files.vehicleImages.length > 6) {
        return res.status(400).json({
          success: false,
          message: "Max 6 images allowed",
        });
      }

      const imageUrls = [];

      for (let file of files.vehicleImages) {
        const url = await uploadToImgBB(file.buffer);
        imageUrls.push({ url });
      }

      payload.vehicleImages = imageUrls;
    }


    const vehicle = await createOrUpdateVehicle(
      user_id,
      payload
    );

    // Driver document nikalo

    if (vehicle) {
      await User.findByIdAndUpdate(
        user_id,
        {
          driver_id: vehicle._id,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle uploaded successfully",
      data: vehicle,
    });

    return res.status(200).json({
      success: true,
      message: "Vehicle uploaded successfully",
      data: vehicle,
    });
  } catch (error) {
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