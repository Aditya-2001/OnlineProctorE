const express = require('express');
const router = express.Router();
const {login, logout, register} = require('../../controllers/login_logout/login_logout');
const {auth} = require('../../controllers/login_logout/authenticate');

/* GET users listing. */
router.post('/signup', register);



router.route('/login')
  .get((req, res) => {
    res.render('login/login');
  })
  .post(login);

router.route('/forgotpassword')
  .get((req,res)=>{
    res.render('forgot_password/forgot_password');
  })
router.post('/logout', auth, logout);

module.exports = router;
