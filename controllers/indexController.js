const getIndexPage = (req, res) => {
  if (req.isAuthenticated()) {
    res.render('homepage');
    return;
  }

  res.render('getStarted');

};

module.exports = {
  getIndexPage,
};
