const Queue = require("bull");
const User = require("../models/user");
const registerationQueue = new Queue("Register-User-Queue");
const {sendEmailQueue} = require('./sendEmail');
const config = require('../config');
const NUM_WORKERS = 5;

registerationQueue.process(NUM_WORKERS, async ({data}) => {
  const newuser = new User(data);
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
      const mailOptions = {
        from: config.email,
        to: data.email,
        subject: "Welcome to OnlineProctorE!",
        text: "Your email has been used to create your account at OnlineProctorE. Login Credentials are as follows : \nUsername : "+data.username+"\nPassword : "+data.password+"\nPassword is auto generated so it is recommended to change ASAP."+"\n\nThanks,\n"+config.projectName
      };
      sendEmailQueue.add({mailOptions: mailOptions});
      return {
        success: true,
        user: doc,
        status: 'Account Created'
      }
    });
  }).clone().catch(function(err){ console.log(err)});
    
});

registerationQueue.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  registerationQueue,
};