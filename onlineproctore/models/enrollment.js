const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const Enrollment = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    required: true,
    autopopulate: true
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    autopopulate: true
  },
  accountType: {
    type: Number,
    required: true
  },
  headTa: {
    type: Boolean,
    required: true
  }},{
    timestamps: true
})

Enrollment.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Enrollment', Enrollment);