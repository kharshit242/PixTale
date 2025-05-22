// src/utils/errorHandler.js
/**
 * Error handling utilities
 */

// Custom API error class
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error middleware for Express
const errorMiddleware = (err, req, res, next) => {
  let error = err;
  
  // If not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Set response status and format
  const response = {
    status: 'error',
    message: error.message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = {
  ApiError,
  errorMiddleware,
};
