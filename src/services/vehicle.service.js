import Vehicle from "../models/vehicle.model.js";
import { uploadToImgBB } from "../services/imgbb.service.js";
import { findNearbyAvailableDriversWithLocation } from "../services/driverLocation.service.js";
import slugify from "slugify";

const parseRoutePoint = (point) => {
  if (!point) return null;

  const latitude = point.latitude ?? point.lat ?? point["latitude"];

  const longitude = point.longitude ?? point.lng ?? point["longitude"];

  if (!latitude || !longitude) {
    return null;
  }

  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
    return null;
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  };
};

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
    badge: data.badge || "",
    subtitle: data.subtitle || "",
    vehicleDistance:
      data.vehicleDistance !== undefined && data.vehicleDistance !== null
        ? Number(data.vehicleDistance)
        : 0,
    vehicleStop: data.vehicleStop === true || data.vehicleStop === "true",
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
  ["serviceId", "createdById", "commissionType", "status", "badge", "subtitle", "vehicleStop"].forEach(
    (key) => {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
  );

  if (data.vehicleDistance !== undefined && data.vehicleDistance !== null) {
    updateData.vehicleDistance = Number(data.vehicleDistance);
  }

  return await Vehicle.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

/**
 * MATCH VEHICLES BY ROUTE
 */
const toRadians = (degrees) => (degrees * Math.PI) / 180;

const getDistanceKm = (a, b) => {
  const R = 6371; // Earth radius km
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    sinLat * sinLat +
    sinLon * sinLon * Math.cos(lat1) * Math.cos(lat2);
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
};

export const getVehiclesByRoute = async (params) => {
  const { pickup, drop, stops } = params;

  const pickupPoint = parseRoutePoint(pickup);
  const dropPoint = parseRoutePoint(drop);

  if (!pickupPoint || !dropPoint) {
    throw new Error("Pickup and drop coordinates are required");
  }

  const stopPoints = (stops || []).map((stop) => parseRoutePoint(stop));

  if (stopPoints.some((point) => point === null)) {
    throw new Error("All stop coordinates must include latitude/longitude");
  }

  const routePoints = [pickupPoint, ...stopPoints, dropPoint];

  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i += 1) {
    totalDistance += getDistanceKm(routePoints[i], routePoints[i + 1]);
  }

  const vehicles = await Vehicle.find({ deletedAt: null, status: "active" }).lean();

  const filtered = vehicles.filter((vehicle) => {
    const supportsStops = Boolean(vehicle.vehicleStop);
    const allowedDistance = Number(vehicle.vehicleDistance) || 0;

    if (stopPoints.length > 0 && !supportsStops) {
      return false;
    }

    if (allowedDistance > 0 && allowedDistance < totalDistance) {
      return false;
    }

    return true;
  });

  return {
    totalDistance,
    count: filtered.length,
    vehicles: filtered,
  };
};

export const getDriversByVehicleRoute = async (params) => {
  const {
    vehicleId,
    pickup,
    drop,
    stops,
    radiusMeters = 3000,
    limit = 10,
  } = params;

  if (!vehicleId) {
    throw new Error("vehicleId is required");
  }

  const pickupPoint = parseRoutePoint(pickup);
  const dropPoint = parseRoutePoint(drop);

  if (!pickupPoint || !dropPoint) {
    throw new Error("Pickup and drop coordinates are required");
  }

  const stopPoints = (stops || []).map((stop) => parseRoutePoint(stop));

  if (stopPoints.some((point) => point === null)) {
    throw new Error("All stop coordinates must include latitude/longitude");
  }

  const routePoints = [pickupPoint, ...stopPoints, dropPoint];

  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i += 1) {
    totalDistance += getDistanceKm(routePoints[i], routePoints[i + 1]);
  }

  const vehicle = await getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.status !== "active") {
    throw new Error("Selected vehicle is not active");
  }

  const supportsStops = Boolean(vehicle.vehicleStop);
  const allowedDistance = Number(vehicle.vehicleDistance) || 0;

  if (stopPoints.length > 0 && !supportsStops) {
    throw new Error("Selected vehicle does not support route stops");
  }

  if (allowedDistance > 0 && allowedDistance < totalDistance) {
    throw new Error("Selected vehicle does not support the requested route distance");
  }

  const nearbyDrivers = await findNearbyAvailableDriversWithLocation({
    longitude: pickupPoint.longitude,
    latitude: pickupPoint.latitude,
    radiusMeters: Number(radiusMeters),
    limit: Number(limit),
  });

  const drivers = nearbyDrivers.map((driver) => ({
    driverId: driver.driverId,
    distance: driver.distance,
    location: driver.location,
    icon: vehicle.vehicleMapIcon || null,
  }));

  return {
    vehicleId,
    totalDistance,
    count: drivers.length,
    vehicleIcon: vehicle.vehicleMapIcon || null,
    drivers,
  };
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