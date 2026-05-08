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
  if (files?.vehicleImage?.[0]) {
    image = await uploadToImgBB(files.vehicleImage[0].buffer);
  }

  if (files?.vehicleMapIcon?.[0]) {
    icon = await uploadToImgBB(files.vehicleMapIcon[0].buffer);
  }

  // SLUG FIX
  const slug = data.slug
    ? slugify(data.slug, { lower: true, strict: true })
    : slugify(data.name || "", { lower: true, strict: true });

  const vehicle = await Vehicle.create({
    name: data.name,
    slug,

    vehicleImage: image,
    vehicleMapIcon: icon,

    serviceId: data.serviceId,
    maxSeat: Number(data.maxSeat),

    baseAmount: Number(data.baseAmount),

    perUnitCharge: Number(data.perUnitCharge),

    perMinuteCharge: Number(data.perMinuteCharge),

    perWeightCharge: Number(data.perWeightCharge),

    cancellationCharge: Number(data.cancellationCharge),
    waitingTimeCharge: Number(data.waitingTimeCharge),

    isAllZones: data.isAllZones === "true" || data.isAllZones === true,

    commissionType: data.commissionType,
    commissionRate: Number(data.commissionRate),

    createdById: data.createdById,
    taxId: data.taxId,

    status: data.status || "active",
  });

  return vehicle;
};

/**
 * GET ALL
 */
export const getVehicles = async () => {
  return await Vehicle.find({ deletedAt: null }).sort({ createdAt: -1 });
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
  if (files?.vehicleImage?.[0]) {
    updateData.vehicleImage = await uploadToImgBB(
      files.vehicleImage[0].buffer
    );
  }

  if (files?.vehicleMapIcon?.[0]) {
    updateData.vehicleMapIcon = await uploadToImgBB(
      files.vehicleMapIcon[0].buffer
    );
  }

  // SAFE NUMBER CONVERSION
  const numberFields = [
    "maxSeat",
    "baseAmount",
    "perUnitCharge",
    "maxPerUnitCharge",
    "perMinuteCharge",
    "maxPerMinuteCharge",
    "perWeightCharge",
    "maxPerWeightCharge",
    "cancellationCharge",
    "waitingTimeCharge",
    "commissionRate",
  ];

  numberFields.forEach((key) => {
    if (data[key] !== undefined) {
      updateData[key] = Number(data[key]);
    }
  });

  // BOOLEAN FIX
  if (data.isAllZones !== undefined) {
    updateData.isAllZones =
      data.isAllZones === "true" || data.isAllZones === true;
  }

  // STRING FIELDS
  ["serviceId", "createdById", "taxId", "commissionType", "status"].forEach(
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
      deletedAt: new Date(),
      status: "inactive",
    },
    { new: true }
  );
};