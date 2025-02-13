// src/middlewares/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle validation errors
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Validation Error',
      errors: err.errors
    });
  }

  // Handle known errors with status codes
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Handle file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File Upload Error',
      error: err.message
    });
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};

module.exports = errorHandler;
