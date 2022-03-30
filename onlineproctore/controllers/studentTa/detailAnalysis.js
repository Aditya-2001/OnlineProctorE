const Submission = require('../../models/submission');
const QuestionSubmission = require('../../models/questionSubmission');
const IllegalAttempt = require('../../models/illegalAttempt');
const config = require('../../config');

exports.getUserSubmission = async (req, res) => {
  try{
    var submission = await Submission.findOneSubmission({_id: req.submissionId});
    var questionSubmissions = await QuestionSubmission.findQuestionSubmissions({submission: req.submissionId});
    var present = await Submission.findSubmissions({quiz: submission.quiz._id, ipAddress: submission.ipAddress});
    var maxPlag = 0;
    for(let i=0; i < questionSubmissions.length; i++){
      maxPlag = Math.max(questionSubmissions[i].webSource.plagiarismPercent, maxPlag);
    }
    var data = {maxPlag: maxPlag, submission: submission, questionSubmissions: questionSubmissions, page: submission.user.username.toUpperCase()};
    if(present.length > 1){
      for(let i=0; i<present.length; i++){
        present[i].usingSomeoneElseIP = false;
        present[i].save();
      }
      data.unique = 'No';
    }
    else{
      for(let i=0; i<present.length; i++){
        present[i].usingSomeoneElseIP = true;
        present[i].save();
      }
      data.unique = 'Yes';
    }
    return res.status(200).render('facultyQuiz/submission', data);
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.updateMarks = async (req, res) => {
  var questionSubmission = await QuestionSubmission.findOneQuestionSubmission({_id: req.body.questionSubmissionId});
  var submission = await Submission.findOneSubmission({_id: req.submissionId});
  submission.writtenScore -= questionSubmission.marksObtained;
  questionSubmission.marksObtained = req.body.marks;
  submission.writtenScore += questionSubmission.marksObtained;
  questionSubmission.checked = true;
  questionSubmission.save();
  submission.save();
  return res.status(200).redirect(req.get('referer'));
}

exports.getIllegalActivities = async (req, res) => {
  var submission = await Submission.findOneSubmission({_id: req.submissionId});
  var illegalAttempts = await IllegalAttempt.findIllegalAttempts({submission: req.submissionId});
  return res.status(200).render('facultyQuiz/proofs', {
    submission: submission, 
    illegalAttempts: illegalAttempts, 
    multipleFace: config.multipleFace, 
    mobile: config.mobile,
    screen: config.screen,
    headPose: config.headPose
  })
}