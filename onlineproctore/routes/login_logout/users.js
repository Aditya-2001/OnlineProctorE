const express = require('express');
const router = express.Router();
const {login, logout, register, 
  forgotPassword, changePassword, renderLogin} = require('../../controllers/login_logout/login_logout');
const {auth} = require('../../controllers/login_logout/authenticate');

/* GET users listing. */
router.post('/createMyOnlineProctorEAccount', register);



router.route('/login')
  .get(renderLogin)
  .post(login);

router.route('/forgotpassword')
  .get((req,res) => res.render('forgot_password/forgot_password'))
  .post(forgotPassword);

router.route('/changepassword/:accesstoken/:tokenHash')
  .get((req,res) => res.render('changepassword/changepassword'))
  .post(changePassword)

router.get('/logout', auth, logout);

module.exports = router;
