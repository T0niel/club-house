const {Router} = require('express');
const isAuth = require('../middlewares/isAuth');
const { getCreateClub } = require('../controllers/clubController');
const router = new Router();

router.get('/create', isAuth, getCreateClub)
router.post('/create', isAuth);

module.exports = router;