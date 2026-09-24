const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  logger.error(err.stack || err.message);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

module.exports = { errorMiddleware, notFound };
