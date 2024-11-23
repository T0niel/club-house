const {Router} = require('express');
const isAuth = require('../middlewares/isAuth');
const { getCreateClub, createClub, getJoinClub, joinClub } = require('../controllers/clubController');
const router = new Router();

router.get('/create', isAuth, getCreateClub)
router.post('/create', isAuth, createClub);

router.get('/join', isAuth, getJoinClub);
router.post('/join', isAuth, joinClub);

module.exports = router;