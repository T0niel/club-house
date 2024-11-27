const getIndexPage = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.user_status_id != 1) {
      res.render('banned');
      return;
    }
    res.render('homepage', { user: req.user, showModal: false });
    return;
  }

  res.render('getStarted');
};

module.exports = {
  getIndexPage,
};
