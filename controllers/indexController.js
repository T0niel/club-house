
const getIndexPage = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('homepage', {user: req.user, showModal: false});
    return;
  }

  res.render('getStarted');
};

module.exports = {
  getIndexPage,
};
