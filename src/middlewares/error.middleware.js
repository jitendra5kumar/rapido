const { validationResult } = require('express-validator');

const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', errors: err.errors });
  }
  
  // Handle custom errors
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Internal server error' });
};

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

module.exports = { errorMiddleware, handleValidationErrors };