const multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/course');
  },
  filename: (req, file, cb) => {
    const fileName = req.body._id + '.' + file.originalname.split('.').slice(-1)[0];
    cb(null, fileName);
  }
})

const imageFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
    return cb(new Error('Not a Image'), false);
  }
  cb(null, true);
}

exports.uploadCourseImage = multer({storage: storage, fileFilter: imageFileFilter});