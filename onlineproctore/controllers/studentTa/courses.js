const User = require('../../models/user');
const Enrollment = require('../../models/enrollment');
const Course = require("../../models/course");
const Quiz = require('../../models/quiz');
const path = require('path');
const fs = require('fs');
const { removeFile } = require("../../functions");
const config = require('../../config');

exports.authUserCourse = async (req, res, next) => {
  try{
    const {course_id} = req.params;
    var user = await User.findOneUser(req.cookies.auth);
    var enrollment = await Enrollment.findOneEnrollment({course: course_id, user: user._id});
    if(!enrollment) throw new Error('Not Enrolled in the Course');
    req.course_id = course_id;
    next();
  }
  catch(err){
    console.log();
    return res.status(400).render('error/error');
  }
}

exports.authUserQuiz = async (req, res, next) => {
  try{
    const {quiz_id} = req.params;
    var user = await User.findOneUser(req.cookies.auth);
    var quiz = await Quiz.findOneQuiz({_id: quiz_id});
    if(!quiz) throw new Error('Quiz does not Exist');
    var enrollment = await Enrollment.findOneEnrollment({course: quiz.course._id, user: user._id});
    if(!enrollment) throw new Error('Not Enrolled in Course');
    req.quizId = quiz_id;
    next();
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.displayCourses = async (req, res) => {
  try{
    var user = await User.findOneUser(req.cookies.auth);
    var enrollments = await Enrollment.findEnrollments({user: user._id});
    return res.status(200).render('studentTa/DashboardStudentTa', {
      success: true,
      enrollments: enrollments,
      page: 'Dashboard',
      backLink: '/dashboard'
    })
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.authHeadTa = async (req, res, next) => {
  try{
    var user = await User.findOneUser(req.cookies.auth);
    var enrollment = await Enrollment.findOneEnrollment({course: req.body._id, user: user._id, headTa: true});
    if(!enrollment) throw new Error('User is not a Head TA in the Course');
    next();
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.changeCourseName = async (req,res) => {
  var course = await Course.findOne({_id: req.body._id});
  course.courseName = req.body.courseName;
  course.save();
  return res.status(204).send();
}

exports.changeCourseImage = async (req,res) => {
  var course = await Course.findOne({_id: req.body._id});
  img = {
    data: fs.readFileSync(path.resolve(__dirname, '../../'+req.file.path)),
    contentType: "image/png"
  }
  course.courseImage = img;
  await course.save();
  removeFile(path.resolve(__dirname, '../../'+req.file.path));
  return res.status(200).redirect('/dashboard');
}

exports.authFacultyTaCourse = async (req, res, next) => {
  try{
    const courseId = req.course_id;
    var user = await User.findOneUser(req.cookies.auth);
    var course = await Course.findOneCourse({_id: courseId, instructors: {$all: [user._id]}});
    var enrollment = await Enrollment.findOneEnrollment({course: courseId, user: user._id});
    if(!course && (!enrollment || (enrollment && enrollment.accountType == config.student))) throw new Error('Invalid Access to Course');
    next();
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.authFacultyTaQuiz = async (req, res, next) => {
  try{
    const quizId = req.quizId;
    var user = await User.findOneUser(req.cookies.auth);
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    const courseId = quiz.course._id;
    var course = await Course.findOneCourse({_id: courseId, instructors: {$all: [user._id]}});
    var enrollment = await Enrollment.findOneEnrollment({course: courseId, user: user._id});
    if(!course && (!enrollment || (enrollment && enrollment.accountType == config.student))) throw new Error('Invalid Access to Quiz');
    next();
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.authFacultyTaQuizAnalysis = async (req, res, next) => {
  try{
    const quizId = req.quizId;
    const {submissionId} = req.params;
    req.submissionId = submissionId;
    var user = await User.findOneUser(req.cookies.auth);
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    const courseId = quiz.course._id;
    var course = await Course.findOneCourse({_id: courseId, instructors: {$all: [user._id]}});
    var enrollment = await Enrollment.findOneEnrollment({course: courseId, user: user._id});
    if(!course && (!enrollment || (enrollment && enrollment.accountType == config.student))) throw new Error('Invalid Access to Quiz');
    next();
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.authStudentQuiz = async (req, res, next) => {
  try{
    const quizId = req.quizId;
    var user = await User.findOneUser(req.cookies.auth);
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    const courseId = quiz.course._id;
    var enrollment = await Enrollment.findOneEnrollment({course: courseId, user: user._id});
    if(!enrollment || (enrollment && enrollment.accountType == config.ta)) throw new Error('Invalid Access to Quiz');
    next();
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}