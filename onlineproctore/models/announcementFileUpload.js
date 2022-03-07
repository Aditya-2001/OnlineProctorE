const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const AnnouncementFileUpload = new Schema({
  announcement: {
    type: Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true,
    autopopulate: true
  },
  uploadedfile: {
    data: Buffer,
    contentType: String
  }},{
    timestamps: true
})

AnnouncementFileUpload.statics.findAnnouncementFileUploads = async function(filter){
  var announcementFileUpload = this;
  var announcementFileUploads = await announcementFileUpload.find(filter).populate('course');
  return announcementFileUploads;
};

AnnouncementFileUpload.statics.findOneAnnouncementFileUpload = async function(filter){
  var announcementFileUpload = this;
  var announcementFileUploads = await announcementFileUpload.findOne(filter).populate('course');
  return announcementFileUploads;
};

AnnouncementFileUpload.plugin(mongooseAutopopulate);
module.exports = mongoose.model('AnnouncementFileUpload', AnnouncementFileUpload);