const { body, validationResult } = require('express-validator');
const { insertClub } = require('../db/queries/clubQueries');
const bcrypt = require('bcryptjs');
const util = require('util');
const HttpError = require('../errors/httpError');
const hashAsync = util.promisify(bcrypt.hash);

const getCreateClub = (req, res) => {
  res.render('homepage', { user: req.user, showModal: true });
};

const createClubSchema = [
  body('name')
    .notEmpty()
    .withMessage('Club name is required')
    .isLength({ min: 3, max: 10 })
    .withMessage('Club name must be between 3 at 10 characters'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 4, max: 40 })
    .withMessage('Club description should be between 4 and 20 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password not provided')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value, { req }) => {
      if (value !== req.body.confirm_password) {
        throw new Error('Confirm Password does not match Password');
      }
      return true;
    }),
  body('confirm_password')
    .notEmpty()
    .withMessage('Confirm password not provided'),
];

const createClub = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errors = errors.array();
    res.render('homepage', {
      user: req.user,
      showModal: true,
    });
    return;
  }

  const { password, name, description } = req.body;
  const { id } = req.user;

  let passwordHash;
  try {
    passwordHash = await hashAsync(password, 10);
  } catch (e) {
    next(new HttpError('Internal server error', 500));
    return;
  }

  try {
    await insertClub(name, description, id, passwordHash);
  } catch (e) {
    next(new HttpError('Club already exists', 409));
    return;
  }

  res.redirect('/');
};

module.exports = {
  getCreateClub,
  createClub: [createClubSchema, createClub],
};
