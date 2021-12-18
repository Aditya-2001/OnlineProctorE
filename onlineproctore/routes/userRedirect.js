const express = require('express');
const router = express.Router();
const config = require('../config');

router.route('/')
  .get((req,res)=>{
    // console.log(req.cookies);
    if(req.cookies.student==config.student){
      return res.status(200).redirect('/dashboard/student')
    }
    else if(req.cookies.ta==config.ta){
      return res.status(200).redirect('/dashboard/ta')
    }
    else if(req.cookies.faculty==config.faculty){
      return res.status(200).redirect('/dashboard/faculty')
    }
    else if(req.cookies.staff==config.staff){
      return res.status(200).redirect('/dashboard/staff')
    }
    return res.status(400).redirect('/users/logout');
  })

module.exports = router;