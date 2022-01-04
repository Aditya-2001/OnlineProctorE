const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const IllegalAttempt = new Schema({
  submission: {
    type: Schema.Types.ObjectId,
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

IllegalAttempt.plugin(mongooseAutopopulate);
module.exports = mongoose.model('IllegalAttempt', IllegalAttempt);