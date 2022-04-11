const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');


const LabSubmission = new Schema({
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
  submitted: {
    type: Boolean,
    default: false
  },
  score: {
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
  }},{
    timestamps: true
})

LabSubmission.statics.findSubmissions = async function(filter){
  var labSubmission = this;
  var labSubmissions = await labSubmission.find(filter).populate('quiz').populate('user');
  return labSubmissions;
};

LabSubmission.statics.findOneSubmission = async function(filter){
  var labSubmission = this;
  var labSubmissions = await labSubmission.findOne(filter).populate('quiz').populate('user');
  return labSubmissions;
};

LabSubmission.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabSubmission', LabSubmission);