const { Router } = require('express');
const { getPostsPage } = require('../controllers/postsController');
const isAuth = require('../middlewares/isAuth');
const router = new Router();

router.get('/:club', isAuth, getPostsPage);

module.exports = router;
