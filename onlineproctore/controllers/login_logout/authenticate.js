const User = require('../../models/user');
const config = require('../../config');

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

const authStaff = (req, res, next) => {
  if(req.cookies.accountType!=config.staff){
    return res.render('error/error',{authorized: true});
  }
  next();
}

const authStudentTa = (req, res, next) => {
  if(req.cookies.accountType!=config.student && req.cookies.accountType!=config.ta){
    return res.render('error/error',{authorized: true});
  }
  next();
}

const authFaculty = (req, res, next) => {
  if(req.cookies.accountType!=config.faculty){
    return res.render('error/error',{authorized: true});
  }
  next();
}

module.exports = {auth, authStaff, authStudentTa, authFaculty};