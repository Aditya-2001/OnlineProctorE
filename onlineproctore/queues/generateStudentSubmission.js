const Queue = require("bull");
const generateStudentSubmission = new Queue("Generate-Student-Submission");
const Enrollment = require('../models/enrollment');
const Submission = require('../models/submission');
const Question = require('../models/question');
const QuestionSubmission = require('../models/questionSubmission');
const questionSubmission = require("../models/questionSubmission");
const NUM_WORKERS = 10;

generateStudentSubmission.process(NUM_WORKERS, async ({data}) => {
  const submissionId = data.submissionId;
  const quizId = data.quizId;
  await Submission.findOne({_id: submissionId}, async (err, submission) => {
    await questionSubmission.find({submission: submissionId}, async (err, qsubmissions) => {
      let deleteQSubmissions = qsubmissions.map(function(qsubmission, index){
        return new Promise(function(resolve){
          qsubmission.remove();
          resolve();
        })
      })
      Promise.all(deleteQSubmissions).then(async function(){
        await Question.find({quiz: quizId, set: submission.set}, async (err, questions) => {
          for await(let question of questions){
            await QuestionSubmission.exists({submission: submission._id, question: question._id}, async (err, questionSubmission) => {
              if(!questionSubmission){
                await QuestionSubmission.create({submission: submission._id, question: question._id, mcq: question.mcq});
              }
            })
          }
        }).clone().catch(function(err){console.log(err)})
      })
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
});

generateStudentSubmission.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  generateStudentSubmission,
};