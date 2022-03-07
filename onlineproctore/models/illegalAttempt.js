const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const IllegalAttempt = new Schema({
  submission: {
    type: Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    autopopulate: true
  },
  activity: {
    type: Number,
    required: true
  },
  image: {
    type: String
  }},{
    timestamps: true
})

IllegalAttempt.statics.findIllegalAttempts = async function(filter){
  var illegalAttempt = this;
  var illegalAttempts = await illegalAttempt.find(filter).populate('submission');
  return illegalAttempts;
};

IllegalAttempt.statics.findOneIllegalAttempt = async function(filter){
  var illegalAttempt = this;
  var illegalAttempts = await illegalAttempt.findOne(filter).populate('submission');
  return illegalAttempts;
};

IllegalAttempt.plugin(mongooseAutopopulate);
module.exports = mongoose.model('IllegalAttempt', IllegalAttempt);