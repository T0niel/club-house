const { body, validationResult } = require('express-validator');
const util = require('util');
const bcrypt = require('bcryptjs');
const {
  getClubsInfoByAdminId,
  getClubByName,
  deleteClubById,
} = require('../db/queries/clubQueries');
const HttpError = require('../errors/httpError');
const clubExists = require('../utils/clubExists');

const compareAsync = util.promisify(bcrypt.compare);

async function getOwnedClubsPage(req, res) {
  const clubs = await getClubsInfoByAdminId(req.user.id);
  res.render('clubs', { clubs, header: 'Owned clubs' });
}

async function getDeleteClubPage(req, res, next) {
  try {
    const { name } = req.params;

    const exists = await clubExists(name);
    if (!exists) {
      throw new HttpError('No such club', 404);
    }

    const club = await getClubByName(name);
    const isOwner = Number(club.user_admin_id) === Number(req.user.id);
    const isAdmin = req.user.user_role_id == 1;

    if (!isOwner && !isAdmin) {
      next(new HttpError('Unauthorized', 401));
      return;
    }

    res.render('deleteClub', { club: { name } });
  } catch (error) {
    next(error);
  }
}

const deleteClubSchema = [
  body('name').notEmpty().withMessage('Name is required'),
  body('password').notEmpty().withMessage('User password is required'),
];

async function deleteClub(req, res, next) {
  try {
    const { name, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.errors = errors.array();
      res.render('deleteClub', { club: { name } });
      return;
    }

    const match = await compareAsync(password, req.user.password);
    if (!match) {
      res.locals.errors = [{ msg: 'Incorrect password' }];
      res.render('deleteClub', { club: { name } });
      return;
    }

    const club = await getClubByName(name);
    const isOwner = Number(club.user_admin_id) === Number(req.user.id);
    const isAdmin = req.user.user_role_id == 1;

    if (!isOwner && !isAdmin) {
      next(new HttpError('Unauthroized', 401));
      return;
    }

    await deleteClubById(club.id);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOwnedClubsPage,
  getDeleteClubPage,
  deleteClub: [deleteClubSchema, deleteClub],
};
