const sessionCache = require('../cache/session.cache');
const otpCache = require('../cache/otp.cache');

// Cleanup job to remove expired keys (Redis TTL handles most, but this is for manual cleanup if needed)
const cleanupExpiredKeys = async () => {
  // Redis automatically expires keys with TTL, so this is optional
  // In production, you might want to log or handle specific cleanup
  console.log('Running cleanup job...');
  
  // Example: Find and delete expired sessions older than 24 hours
  // This would require scanning keys, which is expensive, so use with caution
};

setInterval(cleanupExpiredKeys, 3600000); // Run every hour

module.exports = cleanupExpiredKeys;