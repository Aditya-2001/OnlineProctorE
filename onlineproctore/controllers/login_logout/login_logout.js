const User = require('../../models/user');
const {registerationQueue} = require('../../queues/registerUser');
exports.register = async (req, res) => {
  await registerationQueue.add({
    username: req.body.username,
    password: req.body.password,
    email: '',
    accountType: '',
  });
  res.end('hh');
}

exports.login = (req,res) => {
  let token=req.cookies.auth;
  User.findByToken(token, (err,user)=>{
    if(err) return res.status(400).json({
      success: false,
      message: "Unable to Log you in"
    });
    if(user){
      return res.status(400).json({
        success: false,
        message: "You are already logged in"
      });
    }
    else{
      User.findOne({'username': req.body.username}, (err, user) => {
        if(!user) {
          return res.status(400).json({
            success: false,
            message: "Authorization failed, username not found"
          });
        }
        
        user.comparepassword(req.body.password, (err, isMatch)=>{
          if(!isMatch) return res.status(400).json({
            success: false,
            message: "Password doesn't match"
          });
          user.generateToken((err,user)=>{
            if(err) return res.status(400).json({
              success: false,
              message: "Unable to generate token"
            });
            res.cookie('auth', user.token).cookie('isAuth', true);
            res.status(200);
            return res.json({redirect: '/dashboard'});
          });    
        });
      });
    }
  });
}

exports.logout = (req,res) => {
  req.user.deleteToken(req.token, (err, user)=>{
    if(err) return res.render('error/error', {authorized: true});
    res.clearCookie('auth');
    res.clearCookie('isAuth');
    req.cookies.auth = null;
    req.cookies.isAuth = null;
    res.redirect('/');
  });
};