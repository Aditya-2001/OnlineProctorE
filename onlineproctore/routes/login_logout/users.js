const express = require('express');
const router = express.Router();
const {login, logout, register} = require('../../controllers/login_logout/login_logout');
const {auth} = require('../../controllers/login_logout/authenticate');

/* GET users listing. */
router.post('/signup', register);
router.post('/login', login);
router.post('/logout', auth, logout);

module.exports = router;
