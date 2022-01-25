const express = require('express');
const router = express.Router();
const manageAccount = require('./manageAccount');
const {authStaff} = require('../../controllers/login_logout/authenticate');
const {getAllAccounts} = require('../../controllers/staff/accountManagement');

router.use(authStaff);

router.route('/')
  .get(getAllAccounts)

/* link opens to /dashboard/staff/users */
router.use('/users', manageAccount);

module.exports = router;