const Submission = require('../../models/submission');
const QuestionSubmission = require('../../models/questionSubmission');
const IllegalAttempt = require('../../models/illegalAttempt');
const config = require('../../config');

exports.getUserSubmission = async (req, res) => {
  await Submission.findOne({_id: req.submissionId}, async (err, submission) => {
    await QuestionSubmission.find({submission: req.submissionId}, async (err, questionSubmissions) => {
      await Submission.find({quiz: submission.quiz._id, ipAddress: submission.ipAddress}, (err, present) => {
        var maxPlag = 0;
        for(let i=0; i < questionSubmissions.length; i++){
          maxPlag = Math.max(questionSubmissions[i].webSource.plagiarismPercent, maxPlag);
        }
        if(present.length > 1){
          for(let i=0; i<present.length; i++){
            present[i].usingSomeoneElseIP = false;
            present[i].save();
          }
          return res.status(200).render('facultyQuiz/submission', {maxPlag: maxPlag, submission: submission, questionSubmissions: questionSubmissions, page: submission.user.username.toUpperCase(), unique: 'No'});
        }
        else{
          for(let i=0; i<present.length; i++){
            present[i].usingSomeoneElseIP = true;
            present[i].save();
          }
          return res.status(200).render('facultyQuiz/submission', {maxPlag: maxPlag, submission: submission, questionSubmissions: questionSubmissions, page: submission.user.username.toUpperCase(), unique: 'Yes'});
        }
      }).clone().catch(function(err){console.log(err)})
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
}

exports.updateMarks = async (req, res) => {
  await QuestionSubmission.findOne({_id: req.body.questionSubmissionId}, async (err, questionSubmission) => {
    await Submission.findOne({_id: req.submissionId}, async (err, submission) => {
      submission.writtenScore -= questionSubmission.marksObtained;
      questionSubmission.marksObtained = req.body.marks;
      submission.writtenScore += questionSubmission.marksObtained;
      questionSubmission.checked = true;
      questionSubmission.save();
      submission.save();
      return res.status(200).redirect(req.get('referer'));
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
}

exports.getIllegalActivities = async (req, res) => {
  await Submission.findOne({_id: req.submissionId}, async (err, submission) => {
    await IllegalAttempt.find({submission: req.submissionId}, async (err, illegalAttempts) => {
      return res.status(200).render('facultyQuiz/proofs', 
      {
        submission: submission, 
        illegalAttempts: illegalAttempts, 
        multipleFace: config.multipleFace, 
        mobile: config.mobile,
        screen: config.screen
      })
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
}