const User = require('../../models/user');

const auth = (req, res, next) => {
  const token = req.cookies.auth;
  User.findByToken(token, (err,user) => {
    if(err) {
      return res.render('error/error',{authorized: false});
    }
    if(!user){
      return res.render('error/error',{authorized: false});
    }
    req.token = token;
    req.user = user;
    next();
  })
}

module.exports = {auth};