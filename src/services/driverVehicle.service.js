import Driver from "../models/driver.model.js";

export const createOrUpdateVehicle = async (user_id, payload) => {
  const vehicle = await Driver.findOneAndUpdate(
    { userId: user_id },
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
  const vehicle = await Driver.findById(vehicle_id);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  vehicle.status = status;
  vehicle.verifiedBy = admin_id;

  // 👉 auto offline if rejected
  if (status !== "approved") {
    vehicle.isOnline = false;
  }

  await vehicle.save();

  return vehicle;
};


export const getAllVehicleDocsservice = async () => {
  const vehicle = await Driver.find()
    .populate("userId", "name email")
    .populate("serviceId")
    .populate("vehicleTypeId")
    .sort({ createdAt: -1 })
    .lean();

  return vehicle;
};