const express = require('express');
const router = express.Router();
const manageAccount = require('./manageAccount');
/* link opens to /dashboard/staff/users */
router.use('/users', manageAccount);

module.exports = router;