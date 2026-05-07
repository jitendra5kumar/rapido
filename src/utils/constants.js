const ROLES = {
  RIDER: 'rider',
  DRIVER: 'driver',
};

const OTP_EXPIRY = 300; // 5 minutes
const SESSION_EXPIRY = 3600; // 1 hour

export const NOTIFICATION_EVENTS = {
  RIDE_SEARCHING: 'ride_searching',
  RIDE_DRIVER_FOUND: 'ride_driver_found',
  RIDE_ACCEPTED: 'ride_accepted',
  RIDE_ARRIVED: 'ride_arrived',
  RIDE_STARTED: 'ride_started',
  RIDE_CANCELLED: 'ride_cancelled',
  RIDE_COMPLETED: 'ride_completed',
  NO_DRIVER_FOUND: 'no_driver_found',
  RIDE_REQUEST: 'ride_request',
  RIDE_SEARCH_TIMEOUT: 'ride_search_timeout',
};

export default {
  ROLES,
  OTP_EXPIRY,
  SESSION_EXPIRY,
  NOTIFICATION_EVENTS,
};

export const RIDE_STATUS = {
  SEARCHING: 'searching',

  ACCEPTED: 'accepted',

  ARRIVED: 'arrived',

  ONGOING: 'ongoing',

  COMPLETED: 'completed',

  CANCELLED: 'cancelled',

  NO_DRIVER_FOUND:
    'no_driver_found',

  SEARCH_TIMEOUT:
    'search_timeout',
};