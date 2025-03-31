
import AppErrors from "../utils/appErrors.js"


//handle cast errors
const handleCastError = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppErrors(message, 400);
};

// handle duplicate fields
const handleDuplicateField = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const messages = `Duplicate field  ${value} , please enter another value!!`;
  console.log('message', messages)
  return new AppErrors(messages, 400);
};

// handle validation errors
const handleValidatorError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = errors.join('. ');

  return new AppErrors(message, 400);
};
//handle jwt token error
const handleJWTError = () =>
  new AppErrors('You are not logged in please login again!💥', 401);
const handleJWTExpire = () =>
  new AppErrors('Your token was expire please login again!💔💔', 401);

// developement errors
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  // if err is operational ,trusted message : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming or unknown errors : don't leak details to the client
    console.log('ERROR 🌼🌻🌼🌷', err);
    res.status(404).json({
      status: 'fail',
      message: 'something went Very Wrong!!',
    });
  }
};

// GLOBAL ERROR HANDLER FUNCTION

const globalErrorHandler = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    /*  if (err.name === 'CastError') error = handleCastError(err);
     if (err.code === 11000) error = handleDuplicateField(err);
     if (err.name === 'ValidationError') error = handleValidatorError(err);
     if (err.name === 'JsonWebTokenError') error = handleJWTError();
     if (err.name === 'TokenExpiredError') error = handleJWTExpire(); */
    sendErrorPro(error, res);
  }
};
export default globalErrorHandler