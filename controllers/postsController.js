const { getClubByName, clubExists, userHasClub } = require('../db/queries/clubQueries');

async function getPostsPage(req, res) {
  const { club } = req.params;

  const canView = await userAuthToViewPosts(club, req.user.id);
  if (!canView) {
    res.render('posts', {error: {msg: 'You do not belong on this club'}});
    return;
  }

  getClubByName();
  res.render('posts');
}

async function userAuthToViewPosts(club, userId) {
    const exists = await clubExists(club); 
    if(!exists){
        return false;
    }

    const hasClub = await userHasClub(club, userId);
    if(!hasClub){
        return false;
    }

    return true;
}

module.exports = {
  getPostsPage,
};
