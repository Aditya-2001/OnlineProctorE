const Queue = require("bull");
const sendEmailQueue = new Queue("Send-Email-Queue");
const nodemailer = require('nodemailer');
const config = require('../config');
const NUM_WORKERS = 5;

const transporter = nodemailer.createTransport({
  service: config.emailService,
  auth: {
    user: config.email,
    pass: config.emailPassword
  }
});

sendEmailQueue.process(NUM_WORKERS, async ({data}) => {
  const mailOptions = data.mailOptions;
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
    
});

sendEmailQueue.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  sendEmailQueue,
};