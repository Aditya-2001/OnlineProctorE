const express = require('express');
const router = express.Router();
const manageAccount = require('./manageAccount');
const {authStaff} = require('../../controllers/login_logout/authenticate');

router.use(authStaff);

router.route('/')
  .get((req,res)=>{res.status(200).render('staff/DashboardStaff')})

/* link opens to /dashboard/staff/users */
router.use('/users', manageAccount);

module.exports = router;