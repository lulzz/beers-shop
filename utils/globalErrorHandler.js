const AppErr = require('./appError');

const dbCastErrHandler = err =>
  new AppErr(`Invalid ${err.path}: ${err.value}.`, 400);

const dbDuplicateKeyErrHandler = err => {
  const duplicateValue = Object.keys(err.keyValue);
  let message;

  if (err.keyValue.email) {
    message = 'User already exists.';
  } else {
    message = `Duplicate field: ${duplicateValue}. Please use another value.`;
  }

  const modifiedError = new AppErr(message, 400);
  modifiedError.errors = {};

  return modifiedError;
};

const dbValidationErrHandler = err => {
  const errorsArr = Object.keys(err.errors);
  const objError = {};
  errorsArr.forEach(el => {
    objError[el] = err.errors[el].message;
  });

  const modifiedError = new AppErr('Invalid input data.', 400);
  modifiedError.errors = objError;

  return modifiedError;
};

const jwtErrHandler = () => new AppErr('Invalid token. Please log in.', 401);
const jwtExpiredErrHandler = () => {
  return new AppErr('Token expired. Please log in.', 401);
};

const devErrHandler = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const prodErrorHandler = (err, res) => {
  if (err.isOperational) {
    if (err.errors) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors,
      });
    }
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      err,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devErrHandler(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let _err = { ...err, message: err.message };

    if (err.name === 'CastError') _err = dbCastErrHandler(_err);
    if (err.code === 11000) _err = dbDuplicateKeyErrHandler(_err);
    if (err.name === 'ValidationError') _err = dbValidationErrHandler(_err);

    if (err.name === 'JsonWebTokenError') _err = jwtErrHandler();
    if (err.name === 'TokenExpiredError') _err = jwtExpiredErrHandler();

    prodErrorHandler(_err, res);
  }
};
