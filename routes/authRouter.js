const { Router } = require('express');
const { getSingupPage, postSignUp, getLoginPage, postLogin,  } = require('../controllers/authController');
const router = new Router();

router.get('/signup', getSingupPage);
router.post('/signup', postSignUp);

router.get('/login', getLoginPage);
router.post('/login', postLogin);

module.exports = router;