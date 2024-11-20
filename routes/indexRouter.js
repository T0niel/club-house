const {Router} = require('express');
const authRouter = require('./authRouter');
const { getIndexPage } = require('../controllers/indexController');
const router = new Router();

router.get('/', getIndexPage)

router.use(authRouter);

module.exports = router;