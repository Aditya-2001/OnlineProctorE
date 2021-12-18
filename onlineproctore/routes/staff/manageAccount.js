const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/staff');
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

const excelFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(xlsx|xlx)$/)) {
    return cb(new Error('You can upload only excel files!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: excelFileFilter});

const router = express.Router();
const {createAccount} = require('../../controllers/staff/accountManagement');

router.use(bodyParser.json());

/* complete url is /dashboard/staff/users/add */
router.route('/add')
  .get((req, res) => res.status(200).json({sucess: 'true', message: '/dashboard/staff/users/add'}))
  .post(upload.single('excelFile'), createAccount)

module.exports = router;