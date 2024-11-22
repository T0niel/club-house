const {Router} = require('express');
const isAuth = require('../middlewares/isAuth');
const { getCreateClub, createClub } = require('../controllers/clubController');
const router = new Router();

router.get('/create', isAuth, getCreateClub)
router.post('/create', isAuth, createClub);

module.exports = router;