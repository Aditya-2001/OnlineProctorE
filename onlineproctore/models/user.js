const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const config = require('../config');
const jwt = require('jsonwebtoken');
const salt = 10;
const User = new Schema({
  email:{
    type: String,
    unique: 1
  },
  username: {
    type: String,
    required: true,
    unique: 1
  },
  password:{
    type: String,
    required: true,
    minlength: 8
  },
  token:{
    type: String
  },
  student:{
    type: Boolean,
    default: false
  },
  ta:{
    type: Boolean,
    default: false
  },
  faculty:{
    type: Boolean,
    default: false
  },
  staff:{
    type: Boolean,
    default: false
  }},{
    timestamps: true
});

User.pre('save',function(next){
  var user=this;
  if(user.isModified('password')){
    bcrypt.genSalt(salt,function(err,salt){
      if(err) return next(err);
      bcrypt.hash(user.password,salt,function(err,hash){
        if(err) return next(err);
        user.password = hash;
        next();
      })
    })
  }
  else{
    next();
  }
});

User.methods.comparepassword = function(password,cb){
  bcrypt.compare(password,this.password,function(err,isMatch){
    if(err) return cb(next);
    cb(null,isMatch);
  });
}

User.methods.generateToken = function(cb){
  var user =this;
  var token=jwt.sign(user._id.toHexString(),config.secretKey);
  user.token=token;
  user.save(function(err,user){
    if(err) return cb(err);
    cb(null,user);
  })
}

User.statics.findByToken = function(token,cb){
  var user=this;
  jwt.verify(token,config.secretKey, function(err,decode){
    user.findOne({"_id": decode, "token":token},function(err,user){
      if(err) return cb(err);
      cb(null,user);
    })
  })
};

User.methods.deleteToken = function(token,cb){
  var user=this;
  user.update({$unset : {token :1}},function(err,user){
    if(err) return cb(err);
    cb(null,user);
  })
}
module.exports = mongoose.model('User', User);