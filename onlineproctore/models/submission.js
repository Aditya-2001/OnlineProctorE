const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const QuestionSubmission = require('./questionSubmission');
const IllegalAttempt = require('./illegalAttempt');

const Submission = new Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    autopopulate: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true
  },
  set: {
    type: String,
    default: ''
  },
  submitted: {
    type: Boolean,
    default: false
  },
  marksAssigned: {
    type: Boolean,
    default: false
  },
  mcqScore: {
    type: Number,
    default: 0
  },
  writtenScore: {
    type: Number,
    default: 0
  },
  ipAddress: {
    type: String,
    default: ''
  },
  audioDetected: {
    type: Number,
    default: 0
  },
  browserSwitched: {
    type: Number,
    default: 0
  },
  multiplePerson: {
    type: Number,
    default: 0
  },
  noPerson: {
    type: Number,
    default: 0
  },
  mobileDetected: {
    type: Number,
    default: 0
  },
  changeInHeadPose: {
    type: Number,
    default: 0
  },
  screenShared: {
    type: Boolean,
    default: true
  },
  screenSharingTurnedOff: {
    type: Number,
    default: 0
  },
  usingSomeoneElseIP: {
    type: Boolean,
    default: false
  }},{
    timestamps: true
})

Submission.post("remove", async function(res, next) {
  await QuestionSubmission.find({submission: this._id}, async (err, questionSubmissions) => {
    for await (let questionSubmission of questionSubmissions){
      questionSubmission.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await IllegalAttempt.find({submission: this._id}, async (err, illegalAttempts) => {
    for await (let illegalAttempt of illegalAttempts){
      illegalAttempt.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

Submission.statics.findSubmissions = async function(filter){
  var submission = this;
  var submissions = await submission.find(filter).populate('quiz').populate('user');
  return submissions;
};

Submission.statics.findOneSubmission = async function(filter){
  var submission = this;
  var submissions = await submission.findOne(filter).populate('quiz').populate('user');
  return submissions;
};

Submission.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Submission', Submission);