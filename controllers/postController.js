const { body, validationResult } = require('express-validator');
const {
  getClubByName,
  clubExists,
  userHasClub,
} = require('../db/queries/clubQueries');
const { insertPost, getAllPostsAndUsers } = require('../db/queries/postsQueries');
const moment = require('moment');

async function getPostsPage(req, res) {
  const { club } = req.params;

  const canView = await userAuthToViewPosts(club, req.user.id);
  if (!canView) {
    res.render('posts', { error: { msg: 'You do not belong on this club' } });
    return;
  }

  const clubData = await getClubByName(club);
  const posts = await getAllPostsAndUsers();
  res.render('posts', {
    club: {
      ...clubData,
      is_admin: Number(clubData.user_admin_id) === Number(req.user.id),
    },
    posts: posts.map((post) => ({
      ...post,
      formatedDate: moment(post.creation_date).format('MM/DD/YYYY hh:mma'),
      self: post.user_id === req.user.id
    })),
  });
}

async function userAuthToViewPosts(club, userId) {
  const exists = await clubExists(club);
  if (!exists) {
    return false;
  }

  const hasClub = await userHasClub(club, userId);
  if (!hasClub) {
    return false;
  }

  return true;
}

//create logic

async function getCreatePostPage(req, res) {
  const { club } = req.params;

  const canView = await userAuthToViewPosts(club, req.user.id);
  if (!canView) {
    res.render('createPost', {
      error: { msg: 'You do not belong on this club' },
    });
    return;
  }

  const clubData = await getClubByName(club);
  res.render('createPost', { club: clubData });
}

const createPostSchema = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Title should be between 3 and 20 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 3, max: 250 })
    .withMessage('Description should be between 3 and 250 characters'),
];

async function createPost(req, res) {
  const { club } = req.params;
  const clubData = await getClubByName(club);

  const canView = await userAuthToViewPosts(club, req.user.id);
  if (!canView) {
    res.render('createPost', {
      error: { msg: 'You do not belong on this club' },
      club: clubData,
    });
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('createPost', { errors: errors.array(), club: clubData });
    return;
  }

  const { title, description } = req.body;
  const now = new Date();

  await insertPost(title, description, now, req.user.id, clubData.id);

  res.redirect(`/posts/${club}`);
}

module.exports = {
  getPostsPage,
  getCreatePostPage,
  createPost: [createPostSchema, createPost],
};
