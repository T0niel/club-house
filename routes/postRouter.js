const { Router } = require('express');
const { getPostsPage, getCreatePostPage, createPost } = require('../controllers/postController');
const isAuth = require('../middlewares/isAuth');
const router = new Router();

router.get('/:club', isAuth, getPostsPage);
router.get('/:club/create', isAuth, getCreatePostPage);
router.post('/:club/create', isAuth, createPost);

module.exports = router;
