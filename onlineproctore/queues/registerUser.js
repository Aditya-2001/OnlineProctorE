const Queue = require("bull");
const User = require("../models/user");
const registerationQueue = new Queue("Register-User-Queue");
const NUM_WORKERS = 5;

registerationQueue.process(NUM_WORKERS, async ({data}) => {
  const newuser = new User({username: data.username, password: data.password, email: data.email});
  res = data.res;
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