const express = require('express');
const router = express.Router();
const {getCourseQuiz, addQuestions, uploadExcelFile, hideQuiz, disablePrevious, addWrittenQuestion, deleteQuiz, addMCQQuestion} = require('../../controllers/faculty/viewEachQuiz');

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

module.exports = router;