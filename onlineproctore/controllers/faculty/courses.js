const { removeFile } = require("../../functions");
const Course = require("../../models/course");
const User = require("../../models/user");
const path = require('path');
const fs = require('fs');

exports.addCourse = async (req,res) => {
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(400).json({
      success: false,
      message: "Unable add Course"
    });
    img = {
      data: fs.readFileSync(path.resolve(__dirname, '../../uploads/course/demo.jpg')),
      contentType: "image/png"
    }
    const data = {courseName: req.body.courseName, instructors: [user._id], courseImage: img};
    const newCourse = new Course(data);
    newCourse.save((err,doc)=>{
      if(err) return res.status(400).json({
        success: false,
        message: 'Unable to create Course'
      })
      return res.status(204).send();
    })
  })
}

exports.displayCourses = async (req,res) => {
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(204).render('faculty/DashboardFaculty', {
      success: false,
      courses: null
    });
    await Course.find({instructors: {$all : [user._id]}}, async (err, courses) => {
      if(err) return res.status(204).render('faculty/DashboardFaculty', {
        success: false,
        courses: null
      });
      return res.status(200).render('faculty/DashboardFaculty', {
        success: true,
        courses: courses
      })
    }).clone().catch(function(err){ console.log(err)});
  })
  // console.log(courses[0].createdOn.toString().slice(0,-31))
}

exports.changeCourseName = async (req,res) => {
  await Course.findOne({_id: req.body._id}, (err,course) => {
    if(err) return res.status(400).json({
      success: false,
      message: 'Unable to change Course Name'
    })
    course.courseName = req.body.courseName;
    course.save(err => console.log(err));
    return res.status(204).send();
  }).clone().catch(function(err){ console.log(err)});
}

exports.changeCourseImage = async(req,res) => {
  await Course.findOne({_id: req.body._id}, (err,course) => {
    if(err) return res.status(400).json({
      success: false,
      message: 'Unable to change Course Image'
    })
    console.log(req.file);
    img = {
      data: fs.readFileSync(path.resolve(__dirname, '../../'+req.file.path)),
      contentType: "image/png"
    }
    course.courseImage = img;
    course.save();
    removeFile(path.resolve(__dirname, '../../'+req.file.path));
    return res.status(200).redirect('/dashboard');
  }).clone().catch(function(err){ console.log(err)});
}