const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const config = require('../config');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const Course = require('./course');
const Enrollment = require('./enrollment');
const Announcement = require('./announcement');
const Submission = require('./submission');
const salt = 10;

const User = new Schema({
  email:{
    type: String,
    required: true,
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
  tokenHash:{
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

User.post("remove", async function(res, next) {
  await Course.find({instructors: {$all: [this._id]}}, async (err, courses) => {
    for await (let course of courses){
      if(course.instructors.length == 0){
        course.remove();
      }
      else{
        course.save();
      }
    }
  }).clone().catch(function(err){console.log(err)});
  await Enrollment.find({user: this._id}, async (err, enrollments) => {
    for await (let enrollment of enrollments){
      enrollment.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await Announcement.remove({user: this._id}, async (err, announcements) => {
    for await (let announcement of announcements){
      announcement.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await Submission.find({user: this._id}, async (err, submissions) => {
    for await (let submission of submissions){
      submission.remove();
    }
  })
  next();
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
  user.tokenHash=randomstring.generate({
    length: 64,
    charset: 'alphanumeric'
  });
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
  user.update({$unset : {token :1, tokenHash: 1}},function(err,user){
    if(err) return cb(err);
    cb(null,user);
  })
}
module.exports = mongoose.model('User', User);