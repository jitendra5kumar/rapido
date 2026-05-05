import {
  createVehicle,
  updateVehicle,
  getVehicles,
  getVehicleById,
  deleteVehicle,
} from "../services/vehicle.service.js";

/**
 * CREATE VEHICLE
 */
export const createVehicleController = async (req, res) => {
  try {
    const vehicle = await createVehicle(req.body, req.files);

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    console.log("CREATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL VEHICLES
 */
export const getVehiclesController = async (req, res) => {
  try {
    const vehicles = await getVehicles();

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.log("GET ALL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET VEHICLE BY ID
 */
export const getVehicleByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.log("GET BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE VEHICLE
 */
export const updateVehicleController = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("UPDATE BODY:", req.body);
    console.log("UPDATE FILES:", req.files);

    const updatedVehicle = await updateVehicle(id, req.body, req.files);

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE VEHICLE (SOFT DELETE)
 */
export const deleteVehicleController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteVehicle(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.log("DELETE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};