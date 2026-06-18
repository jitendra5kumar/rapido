import { uploadToImgBB } from "../services/imgbb.service.js";
import { createOrUpdateVehicle, updateVehicleStatus, getDriverVehicleByUserId } from "../services/driverVehicle.service.js";
import User from "../models/user.model.js";
import { asyncHandler, response } from "../utils/index.js";

// UPLOAD DRIVER VEHICLE
export const uploadDriverVehicleController = asyncHandler(async (req, res) => {
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
        return response.error(res, "Max 6 images allowed", 400);
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

    if (vehicle) {
      await User.findByIdAndUpdate(
        user_id,
        {
          driver_id: vehicle._id,
        }
      );
    }

    return response.success(res, "Vehicle uploaded successfully", vehicle, 200);
  } catch (error) {
    return response.error(res, error.message, 500);
  }
});

// APPROVE / REJECT DRIVER VEHICLE (Admin/Sub-Admin)
export const approveRejectVehicleController = asyncHandler(async (req, res) => {
  try {
    const { vehicle_id, status } = req.body;

    const admin_id = req.user.id; // auth middleware (admin)

    if (!["approved", "rejected"].includes(status)) {
      return response.error(res, "Invalid status", 400);
    }

    const vehicle = await updateVehicleStatus(
      vehicle_id,
      admin_id,
      status
    );

    return response.success(res, `Vehicle ${status} successfully`, vehicle, 200);
  } catch (error) {
    return response.error(res, error.message, 500);
  }
});

// GET DRIVER VEHICLE
export const getDriverVehicleController = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user.id;
    const vehicle = await getDriverVehicleByUserId(user_id);

    if (!vehicle) {
      return response.error(res, "No vehicle found for this driver", 404);
    }

    return response.success(res, "Vehicle details fetched successfully", vehicle, 200);
  } catch (error) {
    return response.error(res, error.message, 500);
  }
});