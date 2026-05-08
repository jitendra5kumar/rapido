import Redis from 'ioredis';
import { REDIS_URL } from './env.js';

export const RIDE_REQUESTS_STREAM = 'ride_requests';
export const NOTIFICATION_STREAM = 'notification_queue';
export const DRIVERS_GEO_KEY = 'drivers_geo';
export const DISPATCH_CONSUMER_GROUP = 'dispatch_workers';
export const NOTIFICATION_CONSUMER_GROUP = 'notification_workers';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableAutoPipelining: true,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export default redis;
