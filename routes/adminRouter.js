const { Router } = require('express');
const isAdmin = require('../middlewares/isAdmin');
const { getAllClubsPage, getAllUsersPage, changeStatus } = require('../controllers/adminController');
const isAuth = require('../middlewares/isAuth');
const router = new Router();

router.get('/manage-clubs', isAuth, isAdmin, getAllClubsPage);
router.get('/manage-users', isAuth, isAdmin, getAllUsersPage);
router.post('/manage-users/change-status', isAuth, isAdmin, changeStatus);

module.exports = router;
