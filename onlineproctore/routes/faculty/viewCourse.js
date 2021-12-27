const express = require('express');
const router = express.Router();
const {getCourseDetails, uploadExcelFile, addMembers, 
  makeAnnouncement, createQuiz, changeHierarchy, deleteCourse, 
  addSingleMember, viewAnnouncements} = require('../../controllers/faculty/viewEachCourse');

router.route('/')
  .get(getCourseDetails);

router.route('/announcements')
  .get(viewAnnouncements)

router.route('/add')
  .post(uploadExcelFile.single('excelFile'), addMembers)

router.route('/announce')
  .post(makeAnnouncement)

router.route('/createquiz')
  .post(createQuiz)

router.route('/addsingle')
  .post(addSingleMember)

router.route('/delete')
  .post(deleteCourse)

router.route('/changeHierarchy')
  .post(changeHierarchy)

router.route('/addSingleMember')
  .post(addSingleMember)

module.exports = router;