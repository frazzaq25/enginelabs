const AppError = require('../errors/AppError');

function errorHandler(err, req, res, next) {
  if (err.joi || err.isJoi) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = errorHandler;
