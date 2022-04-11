const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const LabTestCase = new Schema({
  labQuestion: {
    type: Schema.Types.ObjectId,
    ref : 'LabQuestion',
    required: true,
    autopopulate: true
  },
  testCaseInput: {
    data: Buffer,
    filename: String
  },
  testCaseOutput: {
    data: Buffer,
    filename: String
  }},{
    timestamps: true
})

LabTestCase.statics.findAnswerPDFs = async function(filter){
  var labTestCase = this;
  var labTestCases = await labTestCase.find(filter).populate('submission');
  return labTestCases;
};

LabTestCase.statics.findOneAnswerPDF = async function(filter){
  var labTestCase = this;
  var labTestCases = await labTestCase.findOne(filter).populate('submission');
  return labTestCases;
};

LabTestCase.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabTestCase', LabTestCase);