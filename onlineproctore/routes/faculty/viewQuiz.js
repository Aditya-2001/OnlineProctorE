const express = require('express');
const router = express.Router();
const {getCourseQuiz, addQuestions, uploadExcelFile, hideQuiz, disablePrevious, addWrittenQuestion, deleteQuiz, addMCQQuestion} = require('../../controllers/faculty/viewEachQuiz');
const {getQuestions, markAnswer, submit, endTest, ipAddress, audio, windowBlurred, screenSharingOff, tabChanged, mobileDetected, multipleFace} = require('../../controllers/studentTa/quiz');

router.route('/')
  .get(getCourseQuiz);

router.route('/addQuestions')
  .post(uploadExcelFile.single('excelFile'), addQuestions)

router.route('/hideQuiz')
  .get(hideQuiz)

router.route('/disablePrevious')
  .get(disablePrevious)

router.route('/addWrittenQuestion')
  .post(addWrittenQuestion)

router.route('/addMCQQuestion')
  .post(addMCQQuestion)

router.route('/deleteQuiz')
  .post(deleteQuiz)

router.route('/getQuestions')
  .get(getQuestions)

router.route('/markAnswer')
  .post(markAnswer);

router.route('/submit')
  .post(submit);

router.route('/endTest')
  .post(endTest);

router.route('/ipAddress')
  .post(ipAddress);

router.route('/audio')
  .post(audio);

router.route('/windowBlurred')
  .post(windowBlurred);

router.route('/screenSharingOff')
  .post(screenSharingOff);

router.route('/tabChanged')
  .post(tabChanged);

router.route('/mobileDetected')
  .post(mobileDetected);

router.route('/multipleFace')
  .post(multipleFace);

module.exports = router;