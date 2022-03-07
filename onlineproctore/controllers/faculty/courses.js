const { removeFile } = require("../../functions");
const Course = require("../../models/course");
const User = require("../../models/user");
const path = require('path');
const fs = require('fs');

exports.addCourse = async (req,res) => {
  try{
    var user = await User.findOneUser(req.cookies.auth);
    img = {
      data: fs.readFileSync(path.resolve(__dirname, '../../uploads/course/demo.jpg')),
      contentType: "image/png"
    }
    const data = {courseName: req.body.courseName, instructors: [user._id], courseImage: img};
    const newCourse = await new Course(data);
    await newCourse.save();
    return res.status(204).send();
  }
  catch(err){
    console.log(err);
    return res.status(204).send();
  }
}

exports.displayCourses = async (req,res) => {
  try{
    var user = await User.findOneUser(req.cookies.auth);
    var courses = await Course.findCourses({instructors: {$all : [user._id]}});
    return res.status(200).render('faculty/DashboardFaculty', {
      success: true,
      courses: courses,
      page: 'Dashboard'
    })
  }
  catch(err){
    console.log(err);
    return res.status(204).render('faculty/DashboardFaculty', {
      success: false,
      courses: [],
      page: 'Dashboard'
    });
  }
}

exports.changeCourseName = async (req,res) => {
  try{
    var course = await Course.findOneCourse({_id: req.body._id});
    course.courseName = req.body.courseName;
    await course.save();
    return res.status(204).send();
  }
  catch(err){
    console.log(err);
    return res.status(204).send();
  }
}

exports.changeCourseImage = async(req,res) => {
  try{
    var course = await Course.findOneCourse({_id: req.body._id});
    img = {
      data: fs.readFileSync(path.resolve(__dirname, '../../'+req.file.path)),
      contentType: "image/png"
    }
    course.courseImage = img;
    await course.save();
    await removeFile(path.resolve(__dirname, '../../'+req.file.path));
    return res.status(200).redirect('/dashboard');
  }
  catch(err){
    console.log(err);
    return res.status(200).redirect('/dashboard');
  }
}