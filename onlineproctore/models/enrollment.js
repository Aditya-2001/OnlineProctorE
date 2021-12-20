const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const Enrollment = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref : 'Course',
    required: true,
    autopopulate: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref : 'User',
    required: true,
    autopopulate: true
  },
  accountType: {
    type: Number,
    required: true
  },
  headTa: {
    type: Boolean,
    default: false
  }},{
    timestamps: true
})

Enrollment.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Enrollment', Enrollment);