const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const LabTestCase = require('./labTestCase');

const LabQuestion = new Schema({
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
  questionImageLinks: [{
    type: String,
    default: ''
  }],
  maximumMarks: {
    type: Number,
    required: true
  },
  constraints: [{
    type: String,
    default: ''
  }],
  sampleTestCaseGiven: {
    type: Boolean
  },
  sampleTestCase: {
    type: String
  },
  sampleOutputTestCase: {
    type: String
  },
  sampleTestCaseExplanationGiven: {
    type: String
  },
  sampleTestCaseExplanation: {
    type: String
  },
  explanationImageLinks: [{
    type: String,
    default: ''
  }]},{
    timestamps: true
})

LabQuestion.post("remove", async function(res, next) {
  await LabTestCase.find({labQuestion: this._id}, async (err, labTestCases) => {
    for await (let labTestCase of labTestCases){
      labTestCase.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

LabQuestion.statics.findQuestions = async function(filter){
  var labQuestion = this;
  var labQuestions = await labQuestion.find(filter).populate('quiz');
  return labQuestions;
};

LabQuestion.statics.findOneQuestion = async function(filter){
  var labQuestion = this;
  var labQuestions = await labQuestion.findOne(filter).populate('quiz');
  return labQuestions;
};

LabQuestion.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabQuestion', LabQuestion);