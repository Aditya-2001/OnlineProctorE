const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const LabCode = new Schema({
  labQuestion: {
    type: Schema.Types.ObjectId,
    ref : 'LabQuestion',
    required: true,
    autopopulate: true
  },
  labSubmission: {
    type: Schema.Types.ObjectId,
    ref : 'LabSubmission',
    required: true,
    autopopulate: true
  },
  tempCode: {
    type: Boolean,
    default: false
  },
  code: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  time: {
    type: Number,
    default: 0
  },
  memory: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now() 
  },
  language: {
    type: String,
    default: 'cpp'
  },
  score: {
    type: Number,
    default: 0
  }},{
    timestamps: true
})

LabCode.statics.findLabCodes = async function(filter){
  var labCode = this;
  var labCodes = await labCode.find(filter).populate('labQuestion').populate('labSubmission');
  return labCodes;
};

LabCode.statics.findOneLabCode = async function(filter){
  var labCode = this;
  var labCodes = await labCode.findOne(filter).populate('labQuestion').populate('labSubmission');
  return labCodes;
};

LabCode.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabCode', LabCode);