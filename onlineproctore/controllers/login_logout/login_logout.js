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
    email: 'iit2029211@iiita.ac.in',
    faculty: true
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
            if(user.student){
              res.cookie('student', config.student);
              res.status(200);
              return res.json({redirect: '/dashboard/student'});
            }
            else if(user.ta){
              res.cookie('ta', config.ta);
              res.status(200);
              return res.json({redirect: '/dashboard/ta'});
            }
            else if(user.faculty){
              res.cookie('faculty', config.faculty);
              res.status(200);
              return res.json({redirect: '/dashboard/faculty'});
            }
            else if(user.staff){
              res.cookie('staff', config.staff);
              res.status(200);
              return res.json({redirect: '/dashboard/staff'});
            }
            return res.status(400).json({
              success: false,
              message: "Unable to log you in"
            });
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
      tokenHash = user.tokenHash;
      link = config.baseLink+'/users/changepassword/'+accesstoken+'/'+tokenHash;
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
  const {accesstoken, tokenHash} = req.params;
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
        if(tokenHash !== user.tokenHash){
          return res.status(400).json({
            success: false,
            message: "Invalid Access"
          });
        }
        user.password = req.body.password;
        user.token = undefined;
        user.tokenHash = undefined;
        user.save();
        if(!req.cookies.isAuth){
          return res.status(200).json({
            redirect: '/users/login'
          });
        }
        else{
          return res.status(200).json({
            redirect: '/users/logout'
          });
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}