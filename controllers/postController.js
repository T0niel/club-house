const { body, validationResult } = require('express-validator');
const {
  getClubByName,
  userHasClub,
} = require('../db/queries/clubQueries');
const {
  insertPost,
  getAllPostsAndUsers,
  setPostStatusToDeleted,
  userHasPost,
} = require('../db/queries/postsQueries');
const moment = require('moment');
const HttpError = require('../errors/httpError');
const clubExists = require('../utils/clubExists');

async function getPostsPage(req, res, next) {
  try {
    const { club } = req.params;

    const clubData = await getClubByName(club);
    const posts = await getAllPostsAndUsers(clubData.id);
    res.render('posts', {
      club: {
        ...clubData,
        is_owner: Number(clubData.user_admin_id) === Number(req.user.id),
      },
      posts: posts.map((post) => ({
        ...post,
        formatedDate: moment(post.creation_date).format('MM/DD/YYYY hh:mma'),
        self: post.user_id === req.user.id,
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function userAuthToViewPosts(req, res, next) {
  try {
    const { club } = req.params;
    const userId = req.user.id;
    const exists = await clubExists(club);
    if (!exists) {
      throw new HttpError('You do not belong to this club', 401);
    }

    const hasClub = await userHasClub(club, userId);
    if (!hasClub) {
      throw new HttpError('You do not belong to this club', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function getCreatePostPage(req, res, next) {
  try {
    const { club } = req.params;

    const clubData = await getClubByName(club);
    res.render('createPost', { club: clubData });
  } catch (error) {
    next(error);
  }
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

async function createPost(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.query;
    const { club } = req.params;

    const clubData = await getClubByName(club);
    const isClubAdmin = Number(clubData.user_admin_id) === Number(req.user.id);

    const hasPost = await userHasPost(user.id, id);
    if (!hasPost && !isClubAdmin) {
      throw new HttpError('User not authorized to modify post', 401);
    }

    await setPostStatusToDeleted(id);
    res.redirect(`/posts/${club}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPostsPage: [userAuthToViewPosts, getPostsPage],
  getCreatePostPage: [userAuthToViewPosts, getCreatePostPage],
  createPost: [userAuthToViewPosts, createPostSchema, createPost],
  deletePost: [userAuthToViewPosts, deletePost],
};
