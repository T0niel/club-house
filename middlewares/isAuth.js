module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  next(new HttpError('User is not autherized to access this route', 401));
};
