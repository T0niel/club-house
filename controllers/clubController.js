const { body, validationResult } = require('express-validator');
const {
  insertClub,
  clubExists,
  getClubByName,
  insertClubMember,
  getClubs,
  deleteClubMember,
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
    const clubId = await insertClub(name, description, id, passwordHash);
    await insertClubMember(clubId, id);
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

  await insertClubMember(club.id, req.user.id);
  res.redirect('/');
}

//get clubs
async function getJoinedClubs(req, res) {
  const { id } = req.user;
  const clubs = await getClubs(id);
  res.render('joinedClubs', {
    clubs: clubs.map((club) => ({
      ...club,
      is_admin: Number(club.user_admin_id) === Number(id),
    })),
  });
}

//leaving club
async function getLeaveClub(req, res, next) {
  const { name } = req.params;

  const exists = await clubExists(name);
  if (!exists) {
    next(new HttpError('No such club', 500));
    return;
  }

  res.render('leaveClub', { club: { name } });
}

const leaveClubSchema = [
  body('name').notEmpty().withMessage('Name is required'),
  body('password').notEmpty().withMessage('User password is required'),
];

async function leaveClub(req, res) {
  const { name, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.locals.errors = errors.array();
    res.render('leaveClub', { club: { name } });
    return;
  }

  const match = await compareAsync(password, req.user.password);
  if (match) {
    res.redirect('/');
    const club = await getClubByName(name);
    await deleteClubMember(club.id, req.user.id);
    return;
  }

  res.locals.errors = [{ msg: 'Incorrect password' }];
  res.render('leaveClub', { club: { name } });
}

module.exports = {
  getCreateClub,
  getJoinClub,
  getJoinedClubs,
  getLeaveClub,
  createClub: [createClubSchema, createClub],
  joinClub: [joinClubSchema, joinClub],
  leaveClub: [leaveClubSchema, leaveClub],
};
