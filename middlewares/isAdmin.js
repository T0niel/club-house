const HttpError = require('../errors/httpError');

module.exports = function (req, res, next) {
  const user = req.user;
  if (user.user_role_id === 1) {
    next();
    return;
  }

  next(new HttpError('Admin only', 401));
};
