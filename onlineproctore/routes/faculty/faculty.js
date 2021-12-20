const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {uploadCourseImage} = require('../../controllers/faculty/courseImageUpload');
const {addCourse, displayCourses, changeCourseName, changeCourseImage, deleteUser} = require('../../controllers/faculty/courses');
const {authFaculty} = require('../../controllers/login_logout/authenticate');
const viewCourse = require('./viewCourse');
const {authUserCourse} = require('../../controllers/faculty/viewEachCourse');

router.use(authFaculty);
router.use(bodyParser.json())

router.route('/')
  .get(displayCourses)

router.route('/add')
  .post(addCourse)

router.route('/changeCourseName')
  .post(changeCourseName)

router.route('/changeCourseImage')
  .post(uploadCourseImage.single('imageFile'),changeCourseImage)

router.route('/delete')
  .get(deleteUser);

router.use('/course/:course_id', authUserCourse, viewCourse);

module.exports = router;