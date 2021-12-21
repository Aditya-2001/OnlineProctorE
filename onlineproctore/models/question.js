const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

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
  }
})

Question.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Question', Question);