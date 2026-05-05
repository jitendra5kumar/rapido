import Zone from '../models/zone.model.js';

const normalizePolygon = (location) => {
  if (!Array.isArray(location) || location.length < 4) {
    throw new Error('Location must be an array of at least 4 points to form a polygon');
  }

  const polygon = location.map((point, index) => {
    if (!point || typeof point.lat === 'undefined' || typeof point.lng === 'undefined') {
      throw new Error(`Location point at index ${index} must include lat and lng`);
    }

    const lat = Number(point.lat);
    const lng = Number(point.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new Error(`Location point at index ${index} must contain valid numeric lat and lng values`);
    }

    return [lng, lat];
  });

  const first = polygon[0];
  const last = polygon[polygon.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    polygon.push(first);
  }

  return polygon;
};

export const createZone = async (userId, { name, city, location, status = 'active' }) => {
  const polygon = normalizePolygon(location);

  const zone = await new Zone({
    name,
    userId,
    city,
    location: {
      type: 'Polygon',
      coordinates: [polygon],
    },
    status,
  }).save();

  return zone;
};

export const updateZone = async (zoneId, userId, { name, city, location, status }) => {
  const zone = await Zone.findById(zoneId);
  if (!zone) {
    throw new Error('Zone not found');
  }

  if (zone.userId.toString() !== userId) {
    throw new Error('Unauthorized to update this zone');
  }

  if (name) zone.name = name;
  if (city) zone.city = city;
  if (status) zone.status = status;

  if (location) {
    const polygon = normalizePolygon(location);
    zone.location = {
      type: 'Polygon',
      coordinates: [polygon],
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
