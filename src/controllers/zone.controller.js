import * as zoneService from '../services/zone.service.js';
import { asyncHandler } from '../utils/index.js';
import { response } from '../utils/index.js';

export const createZone = asyncHandler(async (req, res) => {
  const { name, city, coordinates, radiusInKm, status } = req.body;
  const userId = req.user.id; // Assuming user is attached to request via auth middleware

  const zone = await zoneService.createZone(userId, {
    name,
    city,
    coordinates,
    radiusInKm,
    status,
  });

  response.success(res, 'Zone created successfully', zone, 201);
});

export const updateZone = asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  const { name, city, coordinates, radiusInKm, status } = req.body;
  const userId = req.user.id;

  const zone = await zoneService.updateZone(zoneId, userId, {
    name,
    city,
    coordinates,
    radiusInKm,
    status,
  });

  response.success(res, 'Zone updated successfully', zone);
});

export const getZone = asyncHandler(async (req, res) => {
  const { zoneId } = req.params;

  const zone = await zoneService.getZoneById(zoneId);

  response.success(res, 'Zone fetched successfully', zone);
});

export const getUserZones = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const zones = await zoneService.getUserZones(userId);

  response.success(res, 'Zones fetched successfully', zones);
});

export const deleteZone = asyncHandler(async (req, res) => {
  const { zoneId } = req.params;
  const userId = req.user.id;

  const result = await zoneService.deleteZone(zoneId, userId);

  response.success(res, result.message);
});
