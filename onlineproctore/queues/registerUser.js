const Queue = require("bull");
const User = require("../models/user");
const registerationQueue = new Queue("Register-User-Queue");
const {sendEmailQueue} = require('./sendEmail');
const config = require('../config');
const ejs = require('ejs');
const path = require('path');
const NUM_WORKERS = 5;

registerationQueue.process(NUM_WORKERS, async ({data}) => {
  const newuser = new User(data);
  const userdata = data;
  await User.findOne({username: newuser.username}, (err, user) => {
    if(err){
      return {
        success: false,
        user: null,
        status: 'Some thing went wrong'
      }
    }
    if(user)
      return {
        success: false,
        user: null,
        status: 'User already exists'
      }
    newuser.save((err, doc)=>{
      if(err){
        return {
          success: false,
          user: null,
          status: 'Unable to create account'
        }
      }
      ejs.renderFile(path.resolve(__dirname,'../views/email/emailAccountCreation.ejs')
        , {homepageUrl: config.baseLink, username: userdata.username.toUpperCase(), password: userdata.password}
        , function(err, data){
          if (err) {
            console.log(err);
            return {
              success: false,
              user: null,
              status: 'Unable to create account'
            }
          }
          else {
            const mailOptions = {
              from: config.email,
              to: userdata.email,
              subject: "Welcome to OnlineProctorE!",
              html: data
            };
            sendEmailQueue.add({mailOptions: mailOptions});
            return {
              success: true,
              user: doc,
              status: 'Account Created'
            }
          }
        })
    });
  }).clone().catch(function(err){ console.log(err)});
    
});

registerationQueue.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  registerationQueue,
};