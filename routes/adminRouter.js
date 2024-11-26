const { Router } = require('express');
const isAdmin = require('../middlewares/isAdmin');
const { getAllClubsPage } = require('../controllers/adminController');
const router = new Router();

router.get('/manage-clubs', isAdmin, getAllClubsPage);

module.exports = router;
