const { body, validationResult } = require('express-validator');
const {
  getClubByName,
  clubExists,
  userHasClub,
} = require('../db/queries/clubQueries');
const {
  insertPost,
  getAllPostsAndUsers,
} = require('../db/queries/postsQueries');
const moment = require('moment');
const HttpError = require('../errors/httpError');

async function getPostsPage(req, res) {
  const { club } = req.params;

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
      self: post.user_id === req.user.id,
    })),
  });
}

async function userAuthToViewPosts(req, res, next) {
  const { club } = req.params;
  const userId = req.user.id;
  const exists = await clubExists(club);
  if (!exists) {
    return next(new HttpError('You do not belong on this club', 401));
  }

  const hasClub = await userHasClub(club, userId);
  if (!hasClub) {
    return next(
      new HttpError(
        'You do not belong on this club',
        401
      )
    );
  }

  return next();
}

//create logic

async function getCreatePostPage(req, res) {
  const { club } = req.params;

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
  getPostsPage: [userAuthToViewPosts, getPostsPage],
  getCreatePostPage: [userAuthToViewPosts, getCreatePostPage],
  createPost: [userAuthToViewPosts, createPostSchema, createPost],
};
