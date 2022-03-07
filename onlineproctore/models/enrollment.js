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

Enrollment.statics.findEnrollments = async function(filter){
  var enrollment = this;
  var enrollments = await enrollment.find(filter).populate('course').populate('user');
  return enrollments;
};

Enrollment.statics.findOneEnrollment = async function(filter){
  var enrollment = this;
  var enrollments = await enrollment.findOne(filter).populate('course').populate('user');
  return enrollments;
};

Enrollment.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Enrollment', Enrollment);