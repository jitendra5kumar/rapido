import DriverVehicle from "../models/driver.model.js";

export const createOrUpdateVehicle = async (user_id, payload) => {
  const vehicle = await DriverVehicle.findOneAndUpdate(
    { user_id },
    {
      $set: payload,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return vehicle;
};



export const updateVehicleStatus = async (vehicle_id, admin_id, status) => {
  const vehicle = await DriverVehicle.findById(vehicle_id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.status = status;
  vehicle.verified_by = admin_id;

  // 👉 auto offline if rejected
  if (status !== "approved") {
    vehicle.is_online = false;
  }

  await vehicle.save();

  return vehicle;
};