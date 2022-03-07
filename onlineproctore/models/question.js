const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const QuestionSubmission = require('./questionSubmission');

const Question = new Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref : 'Quiz',
    required: true,
    autopopulate: true
  },
  question: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  imageLinks: [{
    type: String,
    default: ''
  }],
  set: {
    type: String,
    default: ''
  },
  maximumMarks: {
    type: Number,
    required: true
  },
  mcq: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String,
    default: ''
  }],
  correctOptions: [{
    type: String,
    default: ''
  }],
  // true ==> Partial Marking
  // false ==> No Partial Marking
  markingScheme: {
    type: Boolean,
    default: true
  },
  negativeMarking: {
    type: Number,
    default: 0
  }},{
    timestamps: true
})

Question.post("remove", async function(res, next) {
  await QuestionSubmission.find({question: this._id}, async (err, questionSubmissions) => {
    for await (let questionSubmission of questionSubmissions){
      questionSubmission.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

Question.statics.findQuestions = async function(filter){
  var question = this;
  var questions = await question.find(filter).populate('course');
  return questions;
};

Question.statics.findOneQuestion = async function(filter){
  var question = this;
  var questions = await question.findOne(filter).populate('course');
  return questions;
};

Question.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Question', Question);