const { body, validationResult } = require('express-validator');
const util = require('util');
const bcrypt = require('bcryptjs');
const {
getClubsInfoByAdminId,
  getClubByName,
  clubExists,
  deleteClubById,
} = require('../db/queries/clubQueries');

const compareAsync = util.promisify(bcrypt.compare);

async function getOwnedClubsPage(req, res) {
  const clubs = await getClubsInfoByAdminId(req.user.id);
  res.render('ownedClubs', { clubs });
}

async function getDeleteClubPage(req, res) {
  try {
    const { name } = req.params;

    const exists = await clubExists(name);
    if (!exists) {
      throw new HttpError('No such club', 404);
    }

    const club = await getClubByName(name);
    const isAdmin = Number(club.user_admin_id) === Number(req.user.id);

    if (!isAdmin) {
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
   const isAdmin = Number(club.user_admin_id) === Number(req.user.id);

   if (!isAdmin) {
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
