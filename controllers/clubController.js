const { body, validationResult } = require('express-validator');
const {
  insertClub,
  clubExists,
  getClubByName,
  insertClubMember,
} = require('../db/queries/clubQueries');
const bcrypt = require('bcryptjs');
const util = require('util');
const HttpError = require('../errors/httpError');
const hashAsync = util.promisify(bcrypt.hash);
const compareAsync = util.promisify(bcrypt.compare);

const getCreateClub = (req, res) => {
  res.render('homepage', { user: req.user, showCreateModal: true });
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

//join club logic

const joinClubSchema = [
  body('name').notEmpty().withMessage('Name is required'),
  body('password').notEmpty().withMessage('Join password is required'),
];

function getJoinClub(req, res) {
  res.render('homepage', { user: req.user, showClubModal: true });
}

async function joinClub(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errors = errors.array();
    res.render('homepage', { user: req.user, showClubModal: true });
    return;
  }

  const { name, password } = req.body;
  const exists = await clubExists(name);
  if (!exists) {
    res.locals.errors = [{ msg: 'No club with this name exists' }];
    res.render('homepage', { user: req.user, showClubModal: true });
    return;
  }

  const club = await getClubByName(name);

  const match = await compareAsync(password, club.join_password);
  if (!match) {
    res.locals.errors = [{ msg: 'incorrect join password' }];
    res.render('homepage', { user: req.user, showClubModal: true });
    return;
  }

  console.log(req.user);
  await insertClubMember(club.id, req.user.id);
  res.redirect('/');
}

module.exports = {
  getCreateClub,
  getJoinClub,
  createClub: [createClubSchema, createClub],
  joinClub: [joinClubSchema, joinClub],
};
