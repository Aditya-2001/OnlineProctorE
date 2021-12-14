const { token } = require('morgan');
const config = require('../../config');
const User = require('../../models/user');
const {registerationQueue} = require('../../queues/registerUser');
const {sendEmailQueue} = require('../../queues/sendEmail');
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

exports.forgotPassword = async (req, res) => {
  if(req.cookies.isAuth){
    return res.status(400).json({success: false, message: 'You are Logged In'});
  }
  email = '';
  username = '';
  if(req.body.email.includes(config.baseEmail)){
    email = req.body.email;
  }
  else{
    try{
      const user = await User.findOne({username: req.body.email});
      if(!user){
        return res.status(400).json({success: false, message: 'Account Not Found'});
      }
      email = user.email;
      username = user.username;
      if(email === ''){
        return res.status(400).json({success: false, message: 'Email Associated with Account Not Found'});
      }
      accesstoken = '';
      user.generateToken((err,user)=>{
        if(err) return res.status(400).json({
          success: false,
          message: "Unable to generate token"
        });
        accesstoken = user.token;
        link = config.baseLink+'/users/changepassword/'+accesstoken;
        const mailOptions = {
          from: config.email,
          to: email,
          subject: 'Link for changing the password',
          text: "Hi "+username+",\nA request was received that you forgot your password. Was it really you? Click on the following confirmation link to update your password.\n\nConfirmation Link is "+link+"\n\nIgnore this email if you do not want to change your password.\n\nThanks,\n"+config.projectName
        };
        sendEmailQueue.add({mailOptions: mailOptions});
        return res.status(200).json({
          success: true,
          message: "Email Sent"
        });
      });
    }catch(err){
      console.log(err);
    }
  }
}

exports.changePassword = async (req,res) => {
  const {accesstoken} = req.params;
  try{
    await User.findByToken(accesstoken, (err,user)=>{
      if(err) return res.status(400).json({
        success: false,
        message: "Unable to change Password"
      });
      if(!user) return res.status(400).json({
        success: false,
        message: "Unable to change Password"
      });
      if(user){
        user.password = req.body.password;
        user.token = undefined;
        user.save();
        return res.status(200).json({
          redirect: '/users/login'
        });
      }
    })
  }catch(err){
    console.log(err);
  }
}