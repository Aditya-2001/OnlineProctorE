const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const QuestionSubmission = new Schema({
  submission: {
    type: Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    autopopulate: true
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    autopopulate: true
  },
  markedForReview: {
    type: Boolean,
    default: false
  },
  notAnswered: {
    type: Boolean,
    default: false
  },
  mcq: {
    type: Boolean,
    default: true
  },
  webDetectionDone: {
    type: Boolean,
    default: false
  },
  optionsMarked: [{
    type: String
  }],
  textfield: {
    type: String,
    default: ''
  },
  marksObtained: {
    type: Number,
    default: 0
  },
  answerLocked: {
    type: Boolean,
    default: false
  },
  checked: {
    type: Boolean,
    default: false
  },
  webSource: {
    plagiarismPercent: {
      type: Number,
      default: 0
    },
    urls: [{
      type: String,
      default: ''
    }]
  },
  studentPlagiarism: [{
    text: {
      type: String
    },
    username: {
      type: String
    },
    percent: {
      type: Number,
      default: 0
    }
  }]},{
    timestamps: true
})

QuestionSubmission.statics.findQuestionSubmissions = async function(filter){
  var questionSubmission = this;
  var questionSubmissions = await questionSubmission.find(filter).populate('submission').populate('question');
  return questionSubmissions;
};

QuestionSubmission.statics.findOneQuestionSubmission = async function(filter){
  var questionSubmission = this;
  var questionSubmissions = await questionSubmission.findOne(filter).populate('submission').populate('question');
  return questionSubmissions;
};

QuestionSubmission.plugin(mongooseAutopopulate);
module.exports = mongoose.model('QuestionSubmission', QuestionSubmission);