const {Router} = require('express');
const isAuth = require('../middlewares/isAuth');
const { getCreateClub, createClub, getJoinClub, joinClub,  getJoinedClubs, getLeaveClub, leaveClub } = require('../controllers/clubController');
const { getOwnedClubsPage, getDeleteClubPage, deleteClub } = require('../controllers/ownedClubsController');
const router = new Router();

router.get('/create', isAuth, getCreateClub)
router.post('/create', isAuth, createClub);

router.get('/join', isAuth, getJoinClub);
router.post('/join', isAuth, joinClub);

router.get('/delete/:name', isAuth, getDeleteClubPage)
router.post('/delete/:name', isAuth, deleteClub);

router.get('/', isAuth, getJoinedClubs);

router.get('/leave/:name', isAuth, getLeaveClub);
router.post('/leave', isAuth, leaveClub);

router.get('/owned', isAuth, getOwnedClubsPage);

module.exports = router;