const { Router } = require('express');
const { getSingupPage, postSignUpPage } = require('../controllers/authController');
const router = new Router();

router.get('/signup', getSingupPage);
router.post('/signup', postSignUpPage);

router.get('/login', (req, res) => {});
router.post('/login', (req, res) => {});

module.exports = router;