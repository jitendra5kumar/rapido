const ROLES = {
  RIDER: 'rider',
  DRIVER: 'driver',
};

const OTP_EXPIRY = 300; // 5 minutes
const SESSION_EXPIRY = 3600; // 1 hour

export default {
  ROLES,
  OTP_EXPIRY,
  SESSION_EXPIRY,
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