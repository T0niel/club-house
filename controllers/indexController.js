
const getIndexPage = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('homepage', {user: req.user});
    return;
  }

  res.render('getStarted');
};

module.exports = {
  getIndexPage,
};
