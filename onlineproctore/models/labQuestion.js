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
    type: Boolean,
    default: false
  },
  sampleInputTestCase: {
    type: String
  },
  sampleOutputTestCase: {
    type: String
  },
  sampleTestCaseExplanationGiven: {
    type: Boolean,
    default: false
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

LabQuestion.statics.findLabQuestions = async function(filter){
  var labQuestion = this;
  var labQuestions = await labQuestion.find(filter).populate('quiz');
  return labQuestions;
};

LabQuestion.statics.findOneLabQuestion = async function(filter){
  var labQuestion = this;
  var labQuestions = await labQuestion.findOne(filter).populate('quiz');
  return labQuestions;
};

LabQuestion.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabQuestion', LabQuestion);