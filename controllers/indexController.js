const getIndexPage = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render('homepage', { user: req.user, showModal: false });
    return;
  }

  res.render('getStarted');
};

module.exports = {
  getIndexPage,
};
