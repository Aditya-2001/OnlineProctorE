const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const Question = require('./question');

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
  labQuiz: {
    type: Boolean,
    default: false
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
  webDetectionDone: {
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
  }},{
    timestamps: true
})

Quiz.post("remove", async function(res, next) {
  await Question.remove({quiz: this._id});
  next();
});

Quiz.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Quiz', Quiz);