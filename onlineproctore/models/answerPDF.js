const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAutopopulate = require('mongoose-autopopulate');

const AnswerPDF = new Schema({
  submission: {
    type: Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
    autopopulate: true
  },
  uploadedfile: {
    data: Buffer,
    contentType: String
  }},{
    timestamps: true
})

AnswerPDF.statics.findAnswerPDFs = async function(filter){
  var answerPDF = this;
  var answerPDFs = await answerPDF.find(filter).populate('submission');
  return answerPDFs;
};

AnswerPDF.statics.findOneAnswerPDF = async function(filter){
  var answerPDF = this;
  var answerPDFs = await answerPDF.findOne(filter).populate('submission');
  return answerPDFs;
};

AnswerPDF.plugin(mongooseAutopopulate);
module.exports = mongoose.model('AnswerPDF', AnswerPDF);