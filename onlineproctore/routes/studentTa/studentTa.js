const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {uploadCourseImage} = require('../../controllers/faculty/courseImageUpload');
const {displayCourses, authHeadTa, changeCourseName, changeCourseImage} = require('../../controllers/studentTa/courses');
const {authStudentTa} = require('../../controllers/login_logout/authenticate');
const viewCourse = require('../faculty/viewCourse');
const {authUserCourse, authUserQuiz} = require('../../controllers/studentTa/courses');
const veiwQuiz = require('../faculty/viewQuiz');

router.use(authStudentTa);
router.use(bodyParser.json())

router.route('/')
  .get(displayCourses)

router.route('/changeCourseName')
  .post(authHeadTa, changeCourseName)

router.route('/changeCourseImage')
  .post([uploadCourseImage.single('imageFile'), authHeadTa], changeCourseImage)

router.use('/course/:course_id', authUserCourse, viewCourse);

router.use('/quiz/:quiz_id', authUserQuiz, veiwQuiz);

module.exports = router;