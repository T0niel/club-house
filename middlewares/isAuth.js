const HttpError = require('../errors/httpError');

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  next(new HttpError('User is not autherized', 401));
};
