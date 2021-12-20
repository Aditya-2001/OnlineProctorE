const express = require('express');
const router = express.Router();
const {getCourseDetails, uploadExcelFile, addMembers, makeAnnouncement, createQuiz, changeHierarchy} = require('../../controllers/faculty/viewEachCourse');

router.route('/')
  .get(getCourseDetails);

router.route('/add')
  .post(uploadExcelFile.single('excelFile'), addMembers)

router.route('/announce')
  .post(makeAnnouncement)

router.route('/createquiz')
  .post(createQuiz)

router.route('/changeHierarchy')
  .post(changeHierarchy)

module.exports = router;