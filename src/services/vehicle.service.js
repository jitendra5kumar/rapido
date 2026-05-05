import Vehicle from "../models/vehicle.model.js";
import { uploadToImgBB } from "../services/imgbb.service.js";
import slugify from "slugify";

/**
 * CREATE VEHICLE
 */
export const createVehicle = async (data, files) => {
  let image = null;
  let icon = null;

  // IMAGE UPLOAD FIX (safe check)
  if (files?.vehicle_image?.[0]) {
    image = await uploadToImgBB(files.vehicle_image[0].buffer);
  }

  if (files?.vehicle_map_icon?.[0]) {
    icon = await uploadToImgBB(files.vehicle_map_icon[0].buffer);
  }

  // SLUG FIX
  const slug = data.slug
    ? slugify(data.slug, { lower: true, strict: true })
    : slugify(data.name || "", { lower: true, strict: true });

  const vehicle = await Vehicle.create({
    name: data.name,
    slug,

    vehicle_image: image,
    vehicle_map_icon: icon,

    service_id: data.service_id,
    max_seat: Number(data.max_seat),

    base_amount: Number(data.base_amount),

    min_per_unit_charge: Number(data.min_per_unit_charge),
    max_per_unit_charge: Number(data.max_per_unit_charge),

    min_per_min_charge: Number(data.min_per_min_charge),
    max_per_min_charge: Number(data.max_per_min_charge),

    min_per_weight_charge: Number(data.min_per_weight_charge),
    max_per_weight_charge: Number(data.max_per_weight_charge),

    cancellation_charge: Number(data.cancellation_charge),
    waiting_time_charge: Number(data.waiting_time_charge),

    is_all_zones: data.is_all_zones === "true" || data.is_all_zones === true,

    commission_type: data.commission_type,
    commission_rate: Number(data.commission_rate),

    created_by_id: data.created_by_id,
    tax_id: data.tax_id,

    status: data.status || "active",
  });

  return vehicle;
};

/**
 * GET ALL
 */
export const getVehicles = async () => {
  return await Vehicle.find({ deleted_at: null }).sort({ createdAt: -1 });
};

/**
 * GET BY ID
 */
export const getVehicleById = async (id) => {
  return await Vehicle.findById(id);
};

/**
 * UPDATE VEHICLE
 */
export const updateVehicle = async (id, data, files) => {
  let updateData = {};

  if (data.name) {
    updateData.name = data.name;
    updateData.slug = slugify(data.name, {
      lower: true,
      strict: true,
    });
  }

  // IMAGE UPDATE
  if (files?.vehicle_image?.[0]) {
    updateData.vehicle_image = await uploadToImgBB(
      files.vehicle_image[0].buffer
    );
  }

  if (files?.vehicle_map_icon?.[0]) {
    updateData.vehicle_map_icon = await uploadToImgBB(
      files.vehicle_map_icon[0].buffer
    );
  }

  // SAFE NUMBER CONVERSION
  const numberFields = [
    "max_seat",
    "base_amount",
    "min_per_unit_charge",
    "max_per_unit_charge",
    "min_per_min_charge",
    "max_per_min_charge",
    "min_per_weight_charge",
    "max_per_weight_charge",
    "cancellation_charge",
    "waiting_time_charge",
    "commission_rate",
  ];

  numberFields.forEach((key) => {
    if (data[key] !== undefined) {
      updateData[key] = Number(data[key]);
    }
  });

  // BOOLEAN FIX
  if (data.is_all_zones !== undefined) {
    updateData.is_all_zones =
      data.is_all_zones === "true" || data.is_all_zones === true;
  }

  // STRING FIELDS
  ["service_id", "created_by_id", "tax_id", "commission_type", "status"].forEach(
    (key) => {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
  );

  return await Vehicle.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

/**
 * SOFT DELETE
 */
export const deleteVehicle = async (id) => {
  return await Vehicle.findByIdAndUpdate(
    id,
    {
      deleted_at: new Date(),
      status: "inactive",
    },
    { new: true }
  );
};