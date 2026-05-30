// driverLocation.service.js

import redis, {
  DRIVERS_GEO_KEY,
} from '../config/redis.js';

const DRIVER_HEARTBEAT_TTL = 15;

const ONLINE_DRIVER_KEY = 'drivers:online';
const BUSY_DRIVER_KEY = 'drivers:busy';
// socket
export const updateDriverLocation = async (
  driverId,
  { lat, lng }
) => {
  if (
    lat === undefined ||
    lng === undefined
  ) {
    throw new Error(
      'Latitude and longitude required'
    );
  }

  const pipeline = redis.pipeline();

  pipeline.geoadd(
    DRIVERS_GEO_KEY,
    lng,
    lat,
    driverId.toString()
  );

  pipeline.sadd(
    ONLINE_DRIVER_KEY,
    driverId.toString()
  );

  pipeline.set(
    `driver:lastSeen:${driverId}`,
    Date.now(),
    'EX',
    DRIVER_HEARTBEAT_TTL
  );

  await pipeline.exec();
};
// logout
// offline
// disconnect
// socket
export const removeDriverLocation =
  async (driverId) => {
    const pipeline = redis.pipeline();

    pipeline.zrem(
      DRIVERS_GEO_KEY,
      driverId.toString()
    );

    pipeline.srem(
      ONLINE_DRIVER_KEY,
      driverId.toString()
    );

    pipeline.del(
      `driver:lastSeen:${driverId}`
    );

    await pipeline.exec();
  };
// Ride Accept Hone Par Driver Busy Status Set Karna Hai
// Ride Complete Hone Par Driver Busy Status Remove Karna Hai
export const setDriverBusyStatus =
  async (driverId, busy) => {
    if (busy) {
      await redis.sadd(
        BUSY_DRIVER_KEY,
        driverId.toString()
      );
    } else {
      await redis.srem(
        BUSY_DRIVER_KEY,
        driverId.toString()
      );
    }
  };

export const findNearbyAvailableDrivers =
  async ({
    longitude,
    latitude,
    radiusMeters = 3000,
    limit = 10,
  }) => {
    const rawDrivers = await redis.call(
      'GEOSEARCH',
      DRIVERS_GEO_KEY,
      'FROMLONLAT',
      longitude,
      latitude,
      'BYRADIUS',
      radiusMeters,
      'm',
      'WITHDIST',
      'ASC',
      'COUNT',
      limit * 5
    );
console.log("rawDrivers", rawDrivers);
    if (
      !rawDrivers ||
      !rawDrivers.length
    ) {
      return [];
    }

    const result = [];

    for (const item of rawDrivers) {
      const driverId = item[0];
      const distance = item[1];

      const [
        isOnline,
        isBusy,
        lastSeen,
      ] = await Promise.all([
        redis.sismember(
          ONLINE_DRIVER_KEY,
          driverId
        ),
        redis.sismember(
          BUSY_DRIVER_KEY,
          driverId
        ),
        redis.get(
          `driver:lastSeen:${driverId}`
        ),
      ]);

      if (!isOnline) {
        continue;
      }

      if (isBusy) {
        continue;
      }

      if (!lastSeen) {
        continue;
      }

      const diff =
        Date.now() - Number(lastSeen);

      if (diff > 15000) {
        continue;
      }

      result.push({
        driverId,
        distance: parseFloat(distance),
      });

      if (result.length >= limit) {
        break;
      }
    }

    return result;
  };

export const getDriverPositions = async (driverIds) => {
  if (!Array.isArray(driverIds) || !driverIds.length) {
    return [];
  }

  const positions = await redis.call(
    'GEO_POS',
    DRIVERS_GEO_KEY,
    ...driverIds
  );

  return driverIds.map((driverId, index) => {
    const position = positions[index];
    return {
      driverId,
      location:
        position && position.length === 2
          ? {
              longitude: parseFloat(position[0]),
              latitude: parseFloat(position[1]),
            }
          : null,
    };
  });
};

export const findNearbyAvailableDriversWithLocation = async (options) => {
  const drivers = await findNearbyAvailableDrivers(options);

  if (!drivers.length) {
    return [];
  }

  const positions = await getDriverPositions(
    drivers.map((driver) => driver.driverId)
  );

  const positionMap = new Map(
    positions.map((item) => [item.driverId, item.location])
  );

  return drivers.map((driver) => ({
    ...driver,
    location: positionMap.get(driver.driverId) || null,
  }));
};