const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const { removeFile } = require('../functions');
const Enrollment = require('./enrollment');
const path = require('path');

const Course = new Schema({
  instructors : [{
    type : Schema.Types.ObjectId,
    ref : 'User',
    required : true,
    autopopulate: true
  }],
  courseImage : {
    type : String,
    default : '/course/demo.jpg'
  },
  courseName : {
    type : String,
    required : true
  },
  createdOn : {
    type : Date,
    default : Date.now
  }},{
    timestamps: true
})

Course.post("remove", async function(res, next) {
  await Enrollment.deleteMany({course: this._id});
  next();
});

Course.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Course', Course);