const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const Submission = new Schema({
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
  marksAssigned: {
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
  }},{
    timestamps: true
})

Submission.post("remove", async function(res, next) {
  await QuestionSubmission.find({submission: this._id}, async (err, questionSubmissions) => {
    for await (let questionSubmission of questionSubmissions){
      questionSubmission.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

Submission.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Submission', Submission);