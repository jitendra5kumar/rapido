// driverLocation.service.js — OPTIMIZED

import redis, { DRIVERS_GEO_KEY } from "../config/redis.js";

const DRIVER_HEARTBEAT_TTL = 20 * 60;
const ONLINE_DRIVER_KEY = "drivers:online";
const BUSY_DRIVER_KEY = "drivers:busy";

export const updateDriverLocation = async (
  driverId,
  vehicleId,
  { lat, lng },
) => {
  if (lat === undefined || lng === undefined) {
    throw new Error("Latitude and longitude required");
  }

  // FIXED: Saari calls ek pipeline mein — 0 extra round trips
  const pipeline = redis.pipeline();
  pipeline.geoadd(DRIVERS_GEO_KEY, lng, lat, driverId.toString());
  pipeline.sadd(ONLINE_DRIVER_KEY, driverId.toString());
  pipeline.set(
    `driver:lastSeen:${driverId}`,
    Date.now(),
    "EX",
    DRIVER_HEARTBEAT_TTL,
  );
  pipeline.set(
    `driver:vehicle:${driverId}`,
    vehicleId,
    "EX",
    DRIVER_HEARTBEAT_TTL,
  ); // TTL bhi lagao
  await pipeline.exec();
};

export const removeDriverLocation = async (driverId) => {
  const pipeline = redis.pipeline();
  pipeline.zrem(DRIVERS_GEO_KEY, driverId.toString());
  pipeline.srem(ONLINE_DRIVER_KEY, driverId.toString());
  pipeline.srem(BUSY_DRIVER_KEY, driverId.toString()); // cleanup busy status bhi
  pipeline.del(`driver:lastSeen:${driverId}`);
  pipeline.del(`driver:vehicle:${driverId}`);
  await pipeline.exec();
};

export const setDriverBusyStatus = async (driverId, busy) => {
  if (busy) {
    await redis.sadd(BUSY_DRIVER_KEY, driverId.toString());
  } else {
    await redis.srem(BUSY_DRIVER_KEY, driverId.toString());
  }
};

export const findNearbyAvailableDrivers = async ({
  longitude,
  latitude,
  radiusMeters = 3000,
  limit = 10,
  vehicleId = null,
}) => {
  // Step 1: Geo search
  const rawDrivers = await redis.call(
    "GEOSEARCH",
    DRIVERS_GEO_KEY,
    "FROMLONLAT",
    longitude,
    latitude,
    "BYRADIUS",
    radiusMeters,
    "m",
    "WITHDIST",
    "ASC",
    "COUNT",
    limit * 5,
  );

  if (!rawDrivers?.length) {
    console.log('DriverSearch: no raw drivers from GEOSEARCH');
    return [];
  }

  // Step 2: SINGLE PIPELINE — sabke liye ek saath
  // Pehle online/busy check karo (sets mein — fast O(1))
  const pipeline = redis.pipeline();
  for (const item of rawDrivers) {
    const driverId = item[0];
    pipeline.sismember(ONLINE_DRIVER_KEY, driverId);
    pipeline.sismember(BUSY_DRIVER_KEY, driverId);
    pipeline.get(`driver:lastSeen:${driverId}`);
    pipeline.get(`driver:vehicle:${driverId}`);
  }
  const pipelineResults = await pipeline.exec();

  // Step 3: Filter karo — zero extra Redis calls
  const now = Date.now();
  const result = [];

  for (let i = 0; i < rawDrivers.length; i++) {
    const driverId = rawDrivers[i][0];
    const distance = rawDrivers[i][1];
    const base = i * 4;

    const isOnline = pipelineResults[base][1];
    const isBusy = pipelineResults[base + 1][1];
    const lastSeen = pipelineResults[base + 2][1];
    const assignedVehicle = pipelineResults[base + 3][1];

    if (!isOnline || isBusy || !lastSeen) continue;
    if (vehicleId && assignedVehicle !== vehicleId.toString()) continue;
    if (now - Number(lastSeen) > DRIVER_HEARTBEAT_TTL * 1000) continue;

    result.push({
      driverId,
      distance: parseFloat(distance),
      vehicleId: assignedVehicle,
    });

    if (result.length >= limit) break;
  }

  return result;
};

export const getDriverPositions = async (driverIds) => {
  if (!Array.isArray(driverIds) || !driverIds.length) return [];

  const positions = await redis.call("GEOPOS", DRIVERS_GEO_KEY, ...driverIds);

  return driverIds.map((driverId, index) => {
    const pos = positions[index];
    return {
      driverId,
      location:
        pos?.length === 2
          ? { longitude: parseFloat(pos[0]), latitude: parseFloat(pos[1]) }
          : null,
    };
  });
};

export const findNearbyAvailableDriversWithLocation = async (options) => {
  const drivers = await findNearbyAvailableDrivers(options);
  if (!drivers.length) return [];

  const positions = await getDriverPositions(drivers.map((d) => d.driverId));
  const positionMap = new Map(positions.map((p) => [p.driverId, p.location]));

  return drivers.map((driver) => ({
    ...driver,
    location: positionMap.get(driver.driverId) || null,
  }));
};
