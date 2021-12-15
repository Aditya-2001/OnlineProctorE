const config = require('../../config');
const User = require('../../models/user');
const {registerationQueue} = require('../../queues/registerUser');
const {sendEmailQueue} = require('../../queues/sendEmail');
const ejs = require('ejs');
const path = require('path');

exports.register = async (req, res) => {
  await registerationQueue.add({
    username: req.body.username,
    password: req.body.password,
    email: 'iit2019211@iiita.ac.in',
    staff: true
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
      ejs.renderFile(path.resolve(__dirname,'../../views/email/emailPasswordChange.ejs')
      , {homepageUrl: config.baseLink, username: username, link: link}
      , function(err, data){
        if (err) {
          console.log(err);
          return res.status(400).json({
            success: false,
            message: "Unable to send email"
          });
        }
        else {
          const mailOptions = {
            from: config.email,
            to: email,
            subject: 'Link for changing the Account password for OnlineProctorE',
            html: data
          };
          sendEmailQueue.add({mailOptions: mailOptions});
          return res.status(200).json({
            success: true,
            message: "Email Sent"
          });
        }
      })
    });
  }catch(err){
    console.log(err);
  }
}

exports.changePassword = async (req,res) => {
  if(req.cookies.isAuth){
    return res.status(400).json({success: false, message: 'You are Logged In'});
  }
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