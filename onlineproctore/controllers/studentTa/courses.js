const User = require('../../models/user');
const Enrollment = require('../../models/enrollment');
const Course = require("../../models/course");
const Quiz = require('../../models/quiz');
const path = require('path');
const fs = require('fs');
const { removeFile } = require("../../functions");

exports.authUserCourse = async (req, res, next) => {
  const {course_id} = req.params;
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(400).render('error/error');
    if(!user) return res.status(400).render('error/error');
    await Enrollment.findOne({course: course_id, user: user._id}, async (err, enrollment) => {
      if(err) return res.status(400).render('error/error');
      if(!enrollment) return res.status(400).render('error/error');
      req.course_id = course_id;
      next();
    }).clone().catch(function(err){console.log(err)});
  })
}

exports.authUserQuiz = async (req, res, next) => {
  const {quiz_id} = req.params;
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(400).render('error/error');
    if(!user) return res.status(400).render('error/error');
    await Quiz.findOne({_id: quiz_id}, async (err, quiz) => {
      if(err) return res.status(400).render('error/error');
      if(!quiz) return res.status(400).render('error/error');
      await Enrollment.findOne({course: quiz.course._id, user: user._id}, async (err, enrollment) => {
        if(err) return res.status(400).render('error/error');
        if(!enrollment) return res.status(400).render('error/error');
        req.quizId = quiz_id;
        next();
      }).clone().catch(function(err){console.log(err)});
    }).clone().catch(function(err){console.log(err)})
  })
}

exports.displayCourses = async (req, res) => {
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(200).render('studentTa/DashboardStudentTa', {
      success: false,
      courses: null
    });
    await Enrollment.find({user: user._id}, async (err, enrollments) => {
      if(err) return res.status(200).render('studentTa/DashboardStudentTa', {
        success: false,
        courses: null
      });
      console.log(enrollments);
      return res.status(200).render('studentTa/DashboardStudentTa', {
        success: true,
        enrollments: enrollments,
        page: 'Dashboard'
      })
    }).clone().catch(function(err){ console.log(err)});
  })
}

exports.authHeadTa = async (req, res, next) => {
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(400).render('error/error');
    await Enrollment.findOne({course: req.body._id, user: user._id, headTa: true}, async (err, enrollment) => {
      if(err) return res.status(400).render('error/error');
      if(!enrollment) return res.status(400).render('error/error');
      next();
    }).clone().catch(function(err){ console.log(err)});
  })
}

exports.changeCourseName = async (req,res) => {
  await Course.findOne({_id: req.body._id}, (err,course) => {
    if(err) return res.status(400).json({
      success: false,
      message: 'Unable to change Course Name'
    })
    course.courseName = req.body.courseName;
    course.save(err => console.log(err));
    return res.status(204).send();
  }).clone().catch(function(err){ console.log(err)});
}

exports.changeCourseImage = async(req,res) => {
  await Course.findOne({_id: req.body._id}, (err,course) => {
    if(err) return res.status(400).json({
      success: false,
      message: 'Unable to change Course Image'
    })
    console.log(req.file);
    img = {
      data: fs.readFileSync(path.resolve(__dirname, '../../'+req.file.path)),
      contentType: "image/png"
    }
    course.courseImage = img;
    course.save();
    removeFile(path.resolve(__dirname, '../../'+req.file.path));
    return res.status(200).redirect('/dashboard');
  }).clone().catch(function(err){ console.log(err)});
}