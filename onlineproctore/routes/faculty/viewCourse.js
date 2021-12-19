const express = require('express');
const router = express.Router();
const {getCourseDetails} = require('../../controllers/faculty/viewEachCourse');

router.route('/:course_id')
  .get(getCourseDetails);

module.exports = router;