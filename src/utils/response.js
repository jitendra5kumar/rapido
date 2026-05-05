const success = (res, message, data = null, status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message, status = 400) => {
  res.status(status).json({
    success: false,
    message,
  });
};

export default {
  success,
  error,
};
