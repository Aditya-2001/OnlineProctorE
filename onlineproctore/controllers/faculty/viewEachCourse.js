// Packages
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer');
const Excel = require('exceljs');
const schedule = require('node-schedule');

// Functions and Settings
const config = require("../../config");
const {assignSets} = require('./viewEachQuiz');
const {removeFile} = require('../../functions');

// Models
const Quiz = require("../../models/quiz");
const User = require("../../models/user");
const Course = require("../../models/course");
const Enrollment = require("../../models/enrollment");
const Submission = require("../../models/submission");
const Announcement = require("../../models/announcement");
const LabSubmission = require("../../models/labSubmission");


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
  try{
    const {course_id} = req.params;
    var user = await User.findOneUser(req.cookies.auth);
    var course = await Course.findOneCourse({_id: course_id, instructors: {$all: [user._id]}});
    if(!course){
      throw new Error('Access denied to the Course');
    }
    req.course_id = course_id;
    next();
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.getCourseDetails = async (req,res) => {
  try{
    const course_id = req.course_id;
    var enrollments = await Enrollment.findEnrollments({course: course_id});
    var announcements = await Announcement.findAnnouncements({course: course_id});
    var quizzes = await Quiz.findQuizs({course: course_id});
    var user = await User.findOneUser(req.cookies.auth);
    var enrolledUser = await Enrollment.findOneEnrollment({course: course_id, user: user._id});
    var course = await Course.findOneCourse({_id: course_id});
    for await (let quiz of quizzes){
      if(Date.now() >= quiz.endDate){
        quiz.quizHeld = true;
        quiz.save();
      }
    }
    if(!enrolledUser){
      return res.status(200).render('faculty/Course', {
        user: user,
        course_id: course_id,
        course: course,
        enrollments: enrollments,
        announcements: announcements,
        quizzes: quizzes,
        student: config.student,
        ta: config.ta,
        page: course.courseName,
        backLink: '/dashboard'
      });
    }
    else{
      if(enrolledUser.accountType == config.ta){
        return res.status(200).render('studentTa/Course', {
          user: user,
          course_id: course_id,
          enrolledUser: enrolledUser,
          enrollments: enrollments,
          announcements: announcements,
          quizzes: quizzes,
          student: config.student,
          ta: config.ta,
          page: enrolledUser.course.courseName,
          backLink: '/dashboard'
        });
      }
      else{
        var quizIds = quizzes.map(q => String(q._id));
        var submissions = await Submission.findSubmissions({user: user._id, quiz: {$in: quizIds}});
        var labSubmissions = await LabSubmission.findLabSubmissions({user: user._id, quiz: {$in: quizIds}});
        return res.status(200).render('studentTa/CourseStudent', {
          user: user,
          course_id: course_id,
          enrolledUser: enrolledUser,
          announcements: announcements,
          submissions: submissions,
          labSubmissions: labSubmissions,
          quizzes: quizzes,
          page: enrolledUser.course.courseName,
          backLink: '/dashboard'
        });
      }
    }
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.addMembers = async (req, res) => {
  const course_id = req.course_id;
  const filePath = path.resolve(__dirname, '../../' + req.file.path);
  const workbook = XLSX.readFile(filePath);
  const allSheets = workbook.SheetNames;
  for await (let i of allSheets){
    const accounts = XLSX.utils.sheet_to_json(workbook.Sheets[i]);
    for await (let account of accounts){
      try{
        var email = account.Email;
        var data = {email: email};
        var user = await User.findOne(data);
        if(!user){
          console.log('User Not Found');
          continue;
        }
        var accountType = config.student;
        if(account.Role.toLowerCase() === "faculty"){
          accountType = config.faculty;
          var course = await Course.findOneCourse({course: course_id, instructors: {$all: [user._id]}});
          if(course){
            console.log('Already enrolled in course');
            continue;
          }
          course = await Course.findOne({course: course_id});
          if(!course){
            console.log('Course Not Found');
            continue;
          }
          course.instructors.push(user._id);
          await course.save();
        }
        else{
          if(account.Role.toLowerCase() === "ta"){
            accountType = config.ta;
          }
          const newEnrollment = await new Enrollment({course: course_id, user: user._id, accountType: accountType})
          var enrollment = await Enrollment.findOne({course: course_id, user: user._id});
          if(enrollment){
            console.log('Already Enrolled');
            continue;
          }
          await newEnrollment.save();
        }
      }
      catch(err){
        console.log(err);
        continue;
      }
    }
  }
  await removeFile(filePath);
  return res.status(200).redirect(req.get('referer'));
}

exports.makeAnnouncement = async (req, res) => {
  try{
    const course_id = req.course_id;
    const subject = req.body.subject;
    const message = req.body.message;
    var user = await User.findOneUser(req.cookies.auth);
    const newAnnouncement = await new Announcement({course: course_id, user: user._id, subject: subject, message: message});
    await newAnnouncement.save();
    return res.status(204).send();
  }
  catch(err){
    return res.status(204).send();
  }
}

exports.createQuiz = async(req, res) => {
  try{
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
    const job = schedule.scheduleJob(startDate.getTime() - 20000, async function(){
      console.log('The world is going to end today.');
      assignSets(String(newQuiz._id));
    });
    return res.status(204).send();
  }
  catch(err){
    console.log(err);
    return res.status(204).send();
  }
}

exports.changeHierarchy = async (req, res) => {
  try{
    const headTa = req.body.flag;
    const enrollment_id = req.body._id;
    var enrollment = await Enrollment.findOneEnrollment({_id: enrollment_id});
    enrollment.headTa = headTa;
    enrollment.save();
    return res.status(204).send();
  }
  catch(err){
    console.log(err);
    return res.status(204).send();
  }
}

exports.addSingleMember = async (req, res) => {
  try{
    const course_id = req.course_id;
    const type = req.body.accountType;
    const email = req.body.email;
    var user = await User.findOne({email: email});
    if(!user){
      throw new Error('Account Not Found');
    }
    var accountType = config.student;
    if(type === "faculty"){
      accountType = config.faculty;
      var course = await Course.findOneCourse({course: course_id, instructors: {$all: [user._id]}});
      if(course){
        throw new Error('Already enrolled in course');
      }
      course = await Course.findOne({course: course_id});
      if(!course){
        throw new Error('Course Not Found');
      }
      course.instructors.push(user._id);
      await course.save();
    }
    else{
      if(type === "ta"){
        accountType = config.ta;
      }
      const newEnrollment = await new Enrollment({course: course_id, user: user._id, accountType: accountType})
      var enrollment = await Enrollment.findOne({course: course_id, user: user._id});
      if(enrollment){
        throw new Error('Already Enrolled');
      }
      await newEnrollment.save();
    }
    return res.status(204).send();
  }
  catch(err){
    console.log(err);
    return res.status(204).send();
  }
}

exports.deleteCourse = async (req, res) => {
  const course_id = req.course_id;
  const confirmation = req.body.confirmation;
  if(course_id == confirmation){
    var course = await Course.findOne({_id: course_id})
    course.remove();
    return res.status(200).redirect('/dashboard');
  }
  else{
    return res.status(200).redirect(req.get('referer'));
  }
}

exports.viewAnnouncements = async (req, res) => {
  var announcements;
  try{
    const course_id = req.course_id;
    announcements = await Announcement.findAnnouncements({course: course_id});
  }
  catch(err){
    console.log(err);
    announcements = [];
  }
  var backLink = '/dashboard/user/course/' + course_id;
  if(req.cookies.accountType == config.faculty)
    backLink = '/dashboard/faculty/course/' + course_id;
  return res.status(200).render('studentTa/Announcements', {
    announcements: announcements,
    page: 'Announcements',
    backLink: backLink
  });
}

exports.deleteEnrollment = async (req, res) => {
  var enrollment = await Enrollment.findOne({_id: req.body.id})
  enrollment.remove();
  return res.status(204).send();
}

exports.deleteInstructor = async (req, res) => {
  var course = await Course.findOne({_id: req.course_id})
  for(let i=0; i<course.instructors.length; i++){
    if(String(course.instructors[i]._id) === req.body.id){
      course.instructors.splice(i,1);
      course.save();
      break;
    }
  }
  return res.status(204).send();
}

exports.downloadCourseResults = async (req, res) => {
  res.writeHead(200, {
    'Content-Disposition': 'attachment; filename="results.xlsx"',
    'Transfer-Encoding': 'chunked',
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  var workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: res })
  var quizzes = await Quiz.findQuizs({course: req.course_id})
  let promises = quizzes.map(function(quiz, index){
    return new Promise(async function (resolve){
      var worksheet = workbook.addWorksheet(String(quiz.quizName))
      let rows = [];
      worksheet.addRow(['UserName', 'Total Marks', 'Set', 'Browser Switched', 'Multiple Person', 'Audio Detected', 'Mobile Detected', 'No Person']).commit();
      var submissions = await Submission.findSubmissions({quiz: quiz._id})
      let promises1 = submissions.map(function (submission, index){
        return new Promise(function (resolve){
          var username = submission.user.username;
          var totalMarks = submission.mcqScore + submission.writtenScore;
          var set = submission.set;
          var browserSwitched = submission.browserSwitched;
          var multiplePerson = submission.multiplePerson;
          var audioDetected = submission.audioDetected;
          var mobileDetected = submission.mobileDetected;
          var noPerson = submission.noPerson;
          rows.push([username, totalMarks, set, browserSwitched, multiplePerson, audioDetected, mobileDetected, noPerson]);
          resolve();
        })
      })
      Promise.all(promises1).then(function(){
        for(let j=0; j<rows.length; j++){
          worksheet.addRow(rows[j]).commit()
        }
        worksheet.commit();
      })
      resolve();
    });
  })
  Promise.all(promises).then(function(){
    workbook.commit()
  })
}