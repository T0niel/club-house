const { getAllClubsInfo } = require('../db/queries/clubQueries');
const {
  getAllUsersInfo,
  updateUserStatus,
  findUserById,
} = require('../db/queries/userQueries');
const HttpError = require('../errors/httpError');

async function getAllClubsPage(req, res, next) {
  try {
    const clubs = await getAllClubsInfo();
    res.render('clubs', { clubs, header: 'Manage all the clubs' });
  } catch (e) {
    next(e);
  }
}

async function getAllUsersPage(req, res, next) {
  try {
    const users = await getAllUsersInfo();
    res.render('users', { users, header: 'Manage users' });
  } catch (e) {
    next(e);
  }
}

async function changeStatus(req, res, next) {
  try {
    const { id: userId, status } = req.body;
    const statusId = getStatusId(status);

    const user = await findUserById(userId);
    if (!user) {
      next(new HttpError('This user does not exist', 400));
      return;
    }

    if (user.user_role_id == 1) {
      next(new HttpError('Cannot change the status of a admin', 400));
      return;
    }

    await updateUserStatus(userId, statusId);
    res.redirect('/admin/manage-users');
  } catch (e) {
    next(e);
  }
}

function getStatusId(status) {
  switch (status.toLowerCase()) {
    case 'banned':
      return 2;
    default:
      return 1;
  }
}

module.exports = {
  getAllClubsPage,
  getAllUsersPage,
  changeStatus,
};
