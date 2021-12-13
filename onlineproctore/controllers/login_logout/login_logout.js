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
    if(err) return res(err);
    if(user) return res.status(400).json({
      error: true,
      message: "You are already logged in"
    });
    else{
      User.findOne({'username': req.body.username}, (err, user) => {
        if(!user) return res.json({isAuth: false, message: 'Auth failed ,email not found'});
  
        user.comparepassword(req.body.password, (err, isMatch)=>{
          if(!isMatch) return res.json({isAuth: false, message: "password doesn't match"});
  
          user.generateToken((err,user)=>{
            if(err) return res.status(400).send(err);
            res.cookie('auth', user.token).json({
              isAuth: true,
              id: user._id,
              email: user.email
            });
          });    
        });
      });
    }
  });
}

exports.logout = (req,res) => {
  req.user.deleteToken(req.token, (err, user)=>{
    if(err) return res.status(400).send(err);
    res.sendStatus(200);
  });
};