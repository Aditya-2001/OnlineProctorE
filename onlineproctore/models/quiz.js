const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const Question = require('./question');
const Submission = require('./submission');
const LabSubmission = require('./labSubmission');
const LabQuestion = require('./labQuestion');

const Quiz = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref : 'Course',
    required: true,
    autopopulate: true
  },
  quizName: {
    type: String,
    required: true
  },
  setCount: {
    type: Number,
    default: 0
  },
  setNames: [{
    type: String,
    default: ''
  }],
  labQuiz: {
    type: Boolean,
    default: false
  },
  pdfUpload: {
    type: Boolean,
    default: false
  },
  pdfUploadQuestionCount: {
    type: Number,
    default: 0
  },
  pdfUploadDuration: {
    type: Number,
    default: 10
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  quizHeld: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: true
  },
  mcqMarksGenerated: {
    type: Boolean,
    default: false
  },
  studentAnswersMatched: {
    type: Boolean,
    default: false
  },
  maximumMarks: {
    type: Number,
    default: 0
  },
  disablePrevious: {
    type: Boolean,
    default: false
  },
  illegalAttemptsPresent: {
    type: Boolean,
    default: true
  },
  faceDetector: {
    type: Boolean,
    default: true
  },
  mobileDetector: {
    type: Boolean,
    default: true
  },
  tabSwitchDetector: {
    type: Boolean,
    default: true
  },
  ipAddressDetector: {
    type: Boolean,
    default: true
  },
  headPoseDetector: {
    type: Boolean,
    default: true
  },
  audioDetector: {
    type: Boolean,
    default: true
  }},{
    timestamps: true
})

Quiz.post("remove", async function(res, next) {
  await Question.find({quiz: this._id}, async (err, questions) => {
    for await (let question of questions){
      question.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await Submission.find({quiz: this._id}, async (err, submissions) => {
    for await (let submission of submissions){
      submission.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await LabSubmission.find({quiz: this._id}, async (err, labSubmissions) => {
    for await (let labSubmission of labSubmissions){
      labSubmission.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await LabQuestion.find({quiz: this._id}, async (err, labQuestions) => {
    for await (let labQuestion of labQuestions){
      labQuestion.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

Quiz.statics.findQuizs = async function(filter){
  var quiz = this;
  var quizs = await quiz.find(filter).populate('course');
  return quizs;
};

Quiz.statics.findOneQuiz = async function(filter){
  var quiz = this;
  var quizs = await quiz.findOne(filter).populate('course');
  return quizs;
};

Quiz.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Quiz', Quiz);