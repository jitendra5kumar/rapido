const authMiddleware = require('./auth.middleware');
const { errorMiddleware, handleValidationErrors } = require('./error.middleware');
const rateLimitMiddleware = require('./rateLimit.middleware');

module.exports = {
  authMiddleware,
  errorMiddleware,
  handleValidationErrors,
  rateLimitMiddleware,
};