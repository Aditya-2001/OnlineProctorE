const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');
const AnnouncementFileUpload = require('./announcementFileUpload');

const Announcement = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref : 'Course',
    required: true,
    autopopulate: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref : 'User',
    required: true,
    autopopulate: true
  },
  subject: {
    type: String,
    default: true,
    required: true
  },
  message: {
    type: String,
    default: ""
  },
  containsFile: {
    type: Boolean,
    default: false
  }},{
    timestamps: true
})

Announcement.post('remove', async function(res,next){
  await AnnouncementFileUpload.remove({announcement: this._id});
  next();
})

Announcement.plugin(mongooseAutopopulate);
module.exports = mongoose.model('Announcement', Announcement);