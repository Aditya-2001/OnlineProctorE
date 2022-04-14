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
    data: String,
    filename: String
  },
  testCaseOutput: {
    data: String,
    filename: String
  }},{
    timestamps: true
})

LabTestCase.statics.findLabTestCases = async function(filter){
  var labTestCase = this;
  var labTestCases = await labTestCase.find(filter).populate('labQuestion');
  return labTestCases;
};

LabTestCase.statics.findOneLabTestCase = async function(filter){
  var labTestCase = this;
  var labTestCases = await labTestCase.findOne(filter).populate('labQuestion');
  return labTestCases;
};

LabTestCase.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabTestCase', LabTestCase);