const Queue = require("bull");
const sendEmailQueue = new Queue("Send-Email-Queue");
const nodemailer = require('nodemailer');
const config = require('../config');
const NUM_WORKERS = 1;

const transporter = nodemailer.createTransport({
  service: config.emailService,
  auth: {
    user: config.email,
    pass: config.emailPassword
  }
});

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

sendEmailQueue.process(NUM_WORKERS, async ({data}) => {
  const mailOptions = data.mailOptions;
  setTimeout(async()=>{
    await transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        console.log('Email Was not Sent Successfully')
        return {
          success: false,
          message: 'Email Was not Sent Successfully'
        }
      } else {
        console.log('Email Sent Successfully')
        return {
          success: true,
          message: 'Email Sent Successfully'
        }
      }
    });
  }, between(0, 3000));    
});

sendEmailQueue.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  sendEmailQueue,
};