const express = require('express');
const router = express.Router();
const config = require('../config');

router.route('/')
  .get((req,res)=>{
    // console.log(req.cookies);
    if(req.cookies.accountType==config.student){
      return res.status(200).redirect('/dashboard/student')
    }
    else if(req.cookies.accountType==config.ta){
      return res.status(200).redirect('/dashboard/ta')
    }
    else if(req.cookies.accountType==config.faculty){
      return res.status(200).redirect('/dashboard/faculty')
    }
    else if(req.cookies.accountType==config.staff){
      return res.status(200).redirect('/dashboard/staff')
    }
    return res.status(400).redirect('/users/logout');
  })

module.exports = router;