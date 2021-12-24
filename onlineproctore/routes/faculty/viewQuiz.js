const express = require('express');
const router = express.Router();
const {getCourseQuiz, addQuestions, uploadExcelFile, hideQuiz, disablePrevious, addWrittenQuestion, deleteQuiz} = require('../../controllers/faculty/viewEachQuiz');

router.route('/')
  .get(getCourseQuiz);

router.route('/addquestions')
  .post(uploadExcelFile.single('excelFile'), addQuestions)

router.route('/hidequiz')
  .get(hideQuiz)

router.route('/disableprevious')
  .get(disablePrevious)

router.route('/addwrittenquestion')
  .post(addWrittenQuestion)

router.route('/deletequiz')
  .get(deleteQuiz)

module.exports = router;