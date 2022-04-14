const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const LabCode = require('./labCodes');

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
  questionMarks: [{
    type: Number,
    default: 0
  }],
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

LabSubmission.post("remove", async function(res, next) {
  await LabCode.find({labSubmission: this._id}, async (err, labCodes) => {
    for await (let labCode of labCodes){
      labCode.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

LabSubmission.statics.findLabSubmissions = async function(filter){
  var labSubmission = this;
  var labSubmissions = await labSubmission.find(filter).populate('quiz').populate('user');
  return labSubmissions;
};

LabSubmission.statics.findOneLabSubmission = async function(filter){
  var labSubmission = this;
  var labSubmissions = await labSubmission.findOne(filter).populate('quiz').populate('user');
  return labSubmissions;
};

LabSubmission.plugin(mongooseAutopopulate);
module.exports = mongoose.model('LabSubmission', LabSubmission);