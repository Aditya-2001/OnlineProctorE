const express = require('express');
const router = express.Router();
const {passwordChange, passwordChangePage, profileDisplay, profileChange} = require('../../controllers/login_logout/login_logout');

router.route('/passwordChange')
  .get(passwordChangePage)
  .post(passwordChange)

router.route('/profile')
  .get(profileDisplay)
  .post(profileChange)

module.exports = router;