var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.render('homepage/homepage', {authorized: req.cookies.isAuth});
});

module.exports = router;
