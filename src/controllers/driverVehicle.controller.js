import { uploadToImgBB } from "../services/imgbb.service.js";
import { createOrUpdateVehicle, updateVehicleStatus } from "../services/driverVehicle.service.js";

export const uploadDriverVehicle = async (req, res) => {
  try {
    const user_id = req.user.id; // auth middleware required

    const { rc_number, number_plate, seat_count, service_id } = req.body;

    const files = req.files;

    let payload = {
      rc_number,
      number_plate,
      seat_count,
      service_id,
    };

    // 🚀 Upload vehicle images (max 6)
    if (files?.vehicle_images) {
      if (files.vehicle_images.length > 6) {
        return res.status(400).json({
          success: false,
          message: "Max 6 images allowed",
        });
      }

      const imageUrls = [];

      for (let file of files.vehicle_images) {
        const url = await uploadToImgBB(file.buffer);
        imageUrls.push({ url });
      }

      payload.vehicle_images = imageUrls;
    }

    const vehicle = await createOrUpdateVehicle(user_id, payload);

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