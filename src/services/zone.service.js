import Zone from '../models/zone.model.js';

export const createZone = async (userId, { name, city, coordinates, radiusInKm, status = 'active' }) => {
  // Validate coordinates format [lng, lat]
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error('Coordinates must be an array of [longitude, latitude]');
  }

  const zone = await new Zone({
    name,
    userId,
    city,
    location: {
      type: 'Point',
      coordinates,
    },
    radiusInKm,
    status,
  }).save();

  return zone;
};

export const updateZone = async (zoneId, userId, { name, city, coordinates, radiusInKm, status }) => {
  // Verify zone exists and user has permission
  const zone = await Zone.findById(zoneId);
  if (!zone) {
    throw new Error('Zone not found');
  }

  if (zone.userId.toString() !== userId) {
    throw new Error('Unauthorized to update this zone');
  }

  // Update fields if provided
  if (name) zone.name = name;
  if (city) zone.city = city;
  if (radiusInKm) zone.radiusInKm = radiusInKm;
  if (status) zone.status = status;

  // Update location if coordinates provided
  if (coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error('Coordinates must be an array of [longitude, latitude]');
    }
    zone.location = {
      type: 'Point',
      coordinates,
    };
  }

  await zone.save();
  return zone;
};

export const getZoneById = async (zoneId) => {
  const zone = await Zone.findById(zoneId).populate('city userId');
  if (!zone) {
    throw new Error('Zone not found');
  }
  return zone;
};

export const getUserZones = async (userId) => {
  const zones = await Zone.find({ userId }).populate('city');
  return zones;
};

export const deleteZone = async (zoneId, userId) => {
  const zone = await Zone.findById(zoneId);
  if (!zone) {
    throw new Error('Zone not found');
  }

  if (zone.userId.toString() !== userId) {
    throw new Error('Unauthorized to delete this zone');
  }

  await Zone.findByIdAndDelete(zoneId);
  return { message: 'Zone deleted successfully' };
};
