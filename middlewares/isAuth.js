const HttpError = require('../errors/httpError');

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    if(req.user.user_status_id != 1){
      res.render('banned');
      return;
    }
    return next();
  }

  next(new HttpError('User is not autherized', 401));
};
