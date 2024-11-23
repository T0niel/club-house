const {Router} = require('express');
const isAuth = require('../middlewares/isAuth');
const { getCreateClub, createClub, getJoinClub, joinClub,  getJoinedClubs, getLeaveClub, leaveClub } = require('../controllers/clubController');
const router = new Router();

router.get('/create', isAuth, getCreateClub)
router.post('/create', isAuth, createClub);

router.get('/join', isAuth, getJoinClub);
router.post('/join', isAuth, joinClub);

router.get('/', isAuth, getJoinedClubs);

router.get('/leave/:name', isAuth, getLeaveClub);
router.post('/leave', isAuth, leaveClub);

module.exports = router;