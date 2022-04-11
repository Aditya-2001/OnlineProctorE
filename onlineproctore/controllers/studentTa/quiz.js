const Quiz = require("../../models/quiz");
const User = require("../../models/user");
const Question = require('../../models/question');
const QuestionSubmission = require('../../models/questionSubmission');
const Submission = require('../../models/submission');
const IllegalAttempt = require('../../models/illegalAttempt');
const multer = require('multer');
const AnswerPDF = require('../../models/answerPDF');
const fs = require('fs');
const path = require('path');
const { removeFile } = require("../../functions");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/student');
  },

  filename: async function (req, file, cb) {
    var user = await User.findOneUser(req.cookies.auth);
    fileName = user.username.toUpperCase() + '_' + req.quizId + '.pdf';
    cb(null, fileName);
  }
});

const pdfFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(pdf)$/)) {
    return cb(new Error('You can upload only PDF files!'), false);
  }
  cb(null, true);
};

exports.uploadPDFFile = multer({ storage: storage, fileFilter: pdfFileFilter});

exports.getQuestions = async (req, res) => {
  try{
    const quizId  = req.quizId;
    var user = await User.findOneUser(req.cookies.auth);
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    var submission = await Submission.findOneSubmission({quiz: quizId, user: user._id});
    var questions = await Question.findQuestions({quiz: quizId, set: submission.set});
    var questionSubmissions = await QuestionSubmission.findQuestionSubmissions({submission: submission._id});
    var data = {
      quizId: quizId,
      quiz: quiz,
      questions: questions,
      questionSubmissions: questionSubmissions,
      redirect: false,
      url: ''
    }
    if(Date.now() >= quiz.endDate || submission.submitted){
      data.redirect = true;
      data.url = '/dashboard/user/course/'+quiz.course._id;
      return res.status(200).json(data);
    }
    return res.status(200).json(data)
  }catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.markAnswer = async (req, res) => {
  var questionSubmission = await QuestionSubmission.findOne({submission: req.body.submissionId, question: req.body.questionId});
  questionSubmission.answerLocked = req.body.answerLocked;
  questionSubmission.notAnswered = req.body.notAnswered;
  questionSubmission.markedForReview = req.body.markedForReview;
  if(questionSubmission.mcq){
    questionSubmission.optionsMarked = req.body.markedAnswer;
  }
  else{
    questionSubmission.textfield = req.body.markedAnswer;
  }
  questionSubmission.save();
  return res.status(204).send();
}

exports.submit = async (req, res) => {
  var submission = await Submission.findOne({_id: req.body.submissionId});
  submission.submitted = true;
  submission.save();
  res.status(200).json({
    url: '/dashboard/user/course/'+submission.quiz.course._id
  });
}

exports.endTest = async (req, res) => {
  const quizId = req.quizId;
  var submission = await Submission.findOne({_id: req.body.submissionId});
  submission.submitted = true;
  submission.save();
  var quiz = await Quiz.findOne({_id: quizId});
  quiz.quizHeld = true;
  quiz.save();
  res.status(200).json({
    url: '/dashboard/user/course/'+submission.quiz.course._id
  });
}

exports.getQuizDetectionSettings = async (req, res) => {
  const quizId = req.quizId;
  var quiz = await Quiz.findOne({_id: quizId});
  res.status(200).json({
    faceDetector: quiz.faceDetector,
    mobileDetector: quiz.mobileDetector,
    tabSwitchDetector: quiz.tabSwitchDetector,
    ipAddressDetector: quiz.ipAddressDetector,
    audioDetector: quiz.audioDetector,
    headPoseDetector: quiz.headPoseDetector
  });
}

exports.getTime = async (req, res) => {
  var quiz = await Quiz.findOne({_id: req.quizId});
  var data = {
    time: new Date().getTime(),
    countDownDate: new Date(quiz.endDate).getTime(),
    redirect: false,
    url: ''
  }
  if(quiz.startDate > Date.now()){
    data.redirect = true;
    data.url = '/dashboard/user/course/'+quiz.course._id;
    return res.status(200).json(data);
  }
  return res.status(200).json(data);
}

exports.ipAddress = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.ipAddress = req.body.ip;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.givingQuiz = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.givingQuiz = true;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.exitingQuiz = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.params.submissionId});
    submission.givingQuiz = false;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.audio = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.audioDetected += 1;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.windowBlurred = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.browserSwitched += 1;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.screenSharingOff = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.screenSharingTurnedOff += 1;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.tabChanged = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.browserSwitched += 1;
    submission.save();
    var illegalAttempts = await IllegalAttempt.find({submission: req.body.submissionId, activity: req.body.type});
    if(illegalAttempts.length <= 40){
      await IllegalAttempt.create({submission: req.body.submissionId, activity: req.body.type, image: req.body.frame});
    }
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.mobileDetected = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.mobileDetected += 1;
    submission.save();
    var illegalAttempts = await IllegalAttempt.find({submission: req.body.submissionId, activity: req.body.type});
    if(illegalAttempts.length <= 40){
      await IllegalAttempt.create({submission: req.body.submissionId, activity: req.body.type, image: req.body.frame});
    }
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.multipleFace = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.multiplePerson += 1;
    submission.save();
    var illegalAttempts = await IllegalAttempt.find({submission: req.body.submissionId, activity: req.body.type});
    if(illegalAttempts.length <= 40){
      await IllegalAttempt.create({submission: req.body.submissionId, activity: req.body.type, image: req.body.frame});
    }
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.noPerson = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId})
    submission.noPerson += 1;
    submission.save();
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.headPoseDetection = async (req, res) => {
  try{
    var submission = await Submission.findOne({_id: req.body.submissionId});
    submission.changeInHeadPose += 1;
    submission.save();
    var illegalAttempts = await IllegalAttempt.find({submission: req.body.submissionId, activity: req.body.type});
    if(illegalAttempts.length <= 40){
      await IllegalAttempt.create({submission: req.body.submissionId, activity: req.body.type, image: req.body.frame});
    }
  }catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.uploadPDF = async (req, res) => {
  try{
    const filePath = path.resolve(__dirname, '../../' + req.file.path);
    console.log(req.file);
    var submission = await Submission.findOne({_id: req.body.submissionId});
    var pdfSubmissions = await AnswerPDF.findAnswerPDFs({submission: req.body.submissionId});
    submission.pdfUploaded = true;
    submission.save();
    if(pdfSubmissions.length == 0){
      await AnswerPDF.create({submission: req.body.submissionId});
      pdfSubmissions = await AnswerPDF.findAnswerPDFs({submission: req.body.submissionId});
    }
    pdfSubmissions[0].uploadedfile.data = fs.readFileSync(filePath);
    pdfSubmissions[0].uploadedfile.filename = req.file.filename;
    console.log(fs.readFileSync(filePath));
    pdfSubmissions[0].save();
    console.log(filePath);
    removeFile(filePath);
  }catch(err){
    console.log(err);
  }
  res.status(204).send();
}

exports.downloadSubmission = async (req, res) => {
  try{
    var pdfSubmissions = await AnswerPDF.findAnswerPDFs({submission: req.params.studentsubmissionId});
    console.log(pdfSubmissions.length);
    console.log(req.params.studentsubmissionId)
    if(pdfSubmissions.length != 0){
      const fileName = pdfSubmissions[0].uploadedfile.filename;
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Transfer-Encoding': 'chunked',
      });
      res.end(pdfSubmissions[0].uploadedfile.data, 'binary');
    }
    else{
      res.status(204).send();
    }
  }catch(err){
    console.log(err);
    res.status(204).send();
  }
}