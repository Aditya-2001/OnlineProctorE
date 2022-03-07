const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const Enrollment = require('./enrollment');
const Announcement = require('./announcement');
const Quiz = require('./quiz');

const Course = new Schema({
  instructors : [{
    type : Schema.Types.ObjectId,
    ref : 'User',
    required : true,
    autopopulate: true
  }],
  courseImage : {
    data: Buffer,
    contentType: String
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
  await Enrollment.find({course: this._id}, async (err, enrollments) => {
    for await (let enrollment of enrollments){
      enrollment.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await Announcement.find({course: this._id}, async (err, announcements) => {
    for await (let announcement of announcements){
      announcement.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  await Quiz.find({course: this._id}, async (err, quizzes) => {
    for await (let quiz of quizzes){
      quiz.remove();
    }
  }).clone().catch(function(err){console.log(err)});
  next();
});

Course.statics.findCourses = async function(filter){
  var course = this;
  var courses = await course.find(filter).populate('instructors');
  return courses;
};

Course.statics.findOneCourse = async function(filter){
  var course = this;
  var courses = await course.findOne(filter).populate('instructors');
  return courses;
};

Course.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Course', Course);