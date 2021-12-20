const Course = require("../../models/course");
const Enrollment = require("../../models/enrollment");
const User = require("../../models/user");
const multer = require('multer');
const config = require("../../config");
const path = require('path');
const XLSX = require('xlsx');
const {removeFile} = require('../../functions');
const Announcement = require("../../models/announcement");
const Quiz = require("../../models/quiz");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/faculty');
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

const excelFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(xlsx|xlx)$/)) {
    return cb(new Error('You can upload only excel files!'), false);
  }
  cb(null, true);
};

exports.uploadExcelFile = multer({ storage: storage, fileFilter: excelFileFilter});

exports.authUserCourse = async (req, res, next) => {
  const {course_id} = req.params;
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(400).render('error/error');
    if(!user) return res.status(400).render('error/error');
    await Course.findOne({_id: course_id, instructors: {$all: [user._id]}}, async (err, course) => {
      if(err) return res.status(400).render('error/error');
      if(!course) return res.status(400).render('error/error');
      req.course_id = course_id;
      next();
    }).clone().catch(function(err){console.log(err)});
  })
}

exports.getCourseDetails = async (req,res) => {
  const course_id = req.course_id;
  await Enrollment.find({course: course_id}, async (err, enrollment) => {
    if(err) return res.status(400).json({
      success: true,
      message: 'Error in finding Enrollments to this course'
    })
    await Announcement.find({course: course_id}, async (err, announcement) => {
      if(err) return res.status(400).json({
        success: true,
        message: 'Error in finding Announcements made in this course'
      })
      await Quiz.find({course: course_id}, async (err, quiz) => {
        if(err) return res.status(400).json({
          success: true,
          message: 'Error in finding quizes created in this course'
        })
        return res.status(200).render('faculty/Course', {
          course_id: course_id,
          enrollments: enrollment,
          announcements: announcement,
          quizzes: quiz,
          student: config.student,
          ta: config.ta
        });
      }).clone().catch(function(err){console.log(err)});
    }).clone().catch(function(err){console.log(err)});
  }).clone().catch(function(err){console.log(err)});
}

exports.addMembers = (req, res) => {
  const course_id = req.course_id;
  console.log(course_id);
  const filePath = path.resolve(__dirname, '../../' + req.file.path);
  const workbook = XLSX.readFile(filePath);
  (async function() {
    const allSheets = workbook.SheetNames;
    for await (let i of allSheets){
      const accounts = XLSX.utils.sheet_to_json(workbook.Sheets[i]);
      for await (let account of accounts){
        var email = account.Email;
        var data = {email: email};
        await User.findOne(data, async (err, user) => {
          if(err) console.log(err);
          if(!user) console.log('User Not Found');
          if(user){
            var accountType = config.student; 
            if(account.Role === "Faculty"){
              accountType = config.faculty;
              await Course.findOne({course: course_id}, (err,course) => {
                if(err) console.log(err);
                if(!course) console.log('No Such Course found');
                if(course){
                  if(!course.instructors.some( instructor => instructor._id === user._id)){
                    course.instructors.push(user._id);
                    course.save();
                  }
                }
              }).clone().catch(function(err){console.log(err)});
            }
            else{
              if(account.Role === "TA"){
                accountType = config.ta;
              }
              const newEnrollment = new Enrollment({course: course_id, user: user._id, accountType: accountType})
              await Enrollment.findOne({course: course_id, user: user._id}, (err,enrollment) => {
                if(err) console.log(err);
                if(enrollment) console.log('Already Enrolled');
                if(!enrollment) newEnrollment.save()
              }).clone().catch(function(err){console.log(err)});
            }
          }
        }).clone().catch(function(err){console.log(err)});
      }
    }
    removeFile(filePath);
    console.log(filePath);
    return res.status(200).redirect('/dashboard/faculty/course/'+course_id);
  })();
}

exports.makeAnnouncement = async (req, res) => {
  const course_id = req.course_id;
  const subject = req.body.subject;
  const message = req.body.message;
  await User.findByToken(req.cookies.auth, (err, user) => {
    if(err) return res.status(400).render('error/error');
    if(!user) return res.status(400).render('error/error');
    const newAnnouncement = new Announcement({course: course_id, user: user._id, subject: subject, message: message});
    newAnnouncement.save();
    return res.status(204).send();
  })
}

exports.createQuiz = async(req, res) => {
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const quizName = req.body.quizName;
  const quizHidden = req.body.hidden;
  var hidden = true;
  if(quizHidden === "off"){
    hidden = false;
  }
  const quizType = req.body.quizType;
  var labQuiz = false;
  if(quizType === "Lab"){
    labQuiz = true;
  }
  const course_id = req.course_id;
  const newQuiz = new Quiz({
    course: course_id,
    quizName: quizName,
    hidden: hidden,
    startDate: startDate,
    endDate: endDate,
    labQuiz: labQuiz
  })
  newQuiz.save();
  return res.status(204).send();
}

exports.changeHierarchy = async (req, res) => {
  const headTa = req.body.flag;
  const enrollment_id = req.body._id;
  await Enrollment.findOne({_id: enrollment_id}, (err, enrollment) => {
    if(err) return res.status(400).json({
      success: true,
      message: 'Error in finding Enrollment in this course'
    })
    if(!enrollment) return res.status(400).json({
      success: true,
      message: 'No such Enrollment exists in this course'
    })
    enrollment.headTa = headTa;
    enrollment.save();
    return res.status(204).send();
  }).clone().catch(function(err){console.log(err)});
}