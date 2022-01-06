const express = require('express');
const router = express.Router();
const {getCourseDetails, uploadExcelFile, addMembers, 
  makeAnnouncement, createQuiz, changeHierarchy, deleteCourse, 
  addSingleMember, viewAnnouncements} = require('../../controllers/faculty/viewEachCourse');

const {authFacultyTaCourse} = require('../../controllers/studentTa/courses');

router.route('/')
  .get(getCourseDetails);

router.route('/announcements')
  .get(authFacultyTaCourse, viewAnnouncements)

router.route('/add')
  .post([uploadExcelFile.single('excelFile'), authFacultyTaCourse], addMembers)

router.route('/announce')
  .post(authFacultyTaCourse, makeAnnouncement)

router.route('/createquiz')
  .post(authFacultyTaCourse, createQuiz)

router.route('/delete')
  .post(authFacultyTaCourse, deleteCourse)

router.route('/changeHierarchy')
  .post(authFacultyTaCourse, changeHierarchy)

router.route('/addSingleMember')
  .post(authFacultyTaCourse, addSingleMember)

module.exports = router;