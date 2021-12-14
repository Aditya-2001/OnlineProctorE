const express = require('express');
const router = express.Router();
const {login, logout, register, forgotPassword} = require('../../controllers/login_logout/login_logout');
const {auth} = require('../../controllers/login_logout/authenticate');

/* GET users listing. */
router.post('/signup', register);



router.route('/login')
  .get((req, res) => res.render('login/login'))
  .post(login);

router.route('/forgotpassword')
  .get((req,res) => res.render('forgot_password/forgot_password'))
  .post(forgotPassword);

router.get('/logout', auth, logout);

module.exports = router;
