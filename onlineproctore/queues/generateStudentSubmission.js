const Queue = require("bull");
const generateStudentSubmission = new Queue("Generate-Student-Submission");
const Enrollment = require('../models/enrollment');
const Submission = require('../models/submission');
const Question = require('../models/question');
const QuestionSubmission = require('../models/questionSubmission');
const NUM_WORKERS = 10;

generateStudentSubmission.process(NUM_WORKERS, async ({data}) => {
  const enrollmentId = data.enrollmentId;
  const quizId = data.quizId;
  await Enrollment.findOne({_id: enrollmentId}, async (err, enrollment) => {
    await Submission.exists({quiz: quizId, user: enrollment.user._id}, async (err, submission) => {
      if(!submission){
        await Submission.create({quiz: quizId, user: enrollment.user._id});
      }
      if(submission){
        await Question.find({quiz: quizId}, async (err, questions) => {
          await Submission.findOne({quiz: quizId, user: enrollment.user._id}, async (err, submission) => {
            for await(let question of questions){
              await QuestionSubmission.exists({submission: submission._id, question: question._id}, async (err, questionSubmission) => {
                if(!questionSubmission){
                  await QuestionSubmission.create({submission: submission._id, question: question._id, mcq: question.mcq});
                }
              })
            }
          }).clone().catch(function(err){console.log(err)})
        }).clone().catch(function(err){console.log(err)})
      }
    })
  }).clone().catch(function(err){console.log(err)})
});

generateStudentSubmission.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  generateStudentSubmission,
};