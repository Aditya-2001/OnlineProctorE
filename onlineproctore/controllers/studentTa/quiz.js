const Quiz = require("../../models/quiz");
const User = require("../../models/user");
const Question = require('../../models/question');
const QuestionSubmission = require('../../models/questionSubmission');
const Submission = require('../../models/submission');

exports.getQuestions = async (req, res) => {
  const quizId  = req.quizId;
  await User.findByToken(req.cookies.auth, async (err, user) => {
    await Quiz.findOne({_id: quizId}, async (err, quiz) => {
      await Question.find({quiz: quizId}, async (err, questions) => {
        await Submission.findOne({quiz: quizId, user: user._id}, async (err, submission) => {
          for await(let question of questions){
            await QuestionSubmission.exists({submission: submission._id, question: question._id}, async (err, questionSubmission) => {
              if(!questionSubmission){
                await QuestionSubmission.create({submission: submission._id, question: question._id});
              }
            })
          }
          await QuestionSubmission.find({submission: submission._id}, async (err, questionSubmissions) => {
            return res.status(200).json({
              quizId: quizId,
              quiz: quiz,
              questions: questions,
              questionSubmissions: questionSubmissions
            })
          }).clone().catch(function(err){console.log(err)})
        }).clone().catch(function(err){console.log(err)})
      }).clone().catch(function(err){console.log(err)})
    }).clone().catch(function(err){console.log(err)})
  })
  
}