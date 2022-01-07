const Queue = require("bull");
const answerSimilarity = new Queue("Find-Answer-Similarity");
const QuestionSubmission = require('../models/questionSubmission');
const stringSimilarity = require('string-similarity');
const NUM_WORKERS = 10;

answerSimilarity.process(NUM_WORKERS, async ({data}) => {
  const id = data.id;
  await QuestionSubmission.findOne({_id: id}, async (err, studentSubmission) => {
    await QuestionSubmission.find({question: studentSubmission.question._id}, async (err, questionSubmissions) => {
      if(questionSubmissions.length > 1){
        for await (let questionSubmission of questionSubmissions){
          if(studentSubmission._id.equals(questionSubmission._id)){
            continue;
          }
          if(questionSubmission.textfield == ''){
            studentSubmission.studentPlagiarism.push({
              text: questionSubmission.textfield,
              username: questionSubmission.submission.user.username,
              percent: 0
            })
            studentSubmission.save();
          }
          else{
            var percent = stringSimilarity.compareTwoStrings(studentSubmission.textfield, questionSubmission.textfield);
            studentSubmission.studentPlagiarism.push({
              text: questionSubmission.textfield,
              username: questionSubmission.submission.user.username,
              percent: percent
            })
            studentSubmission.save();
          }
        }
        return {
          success: 'true'
        }
      }
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
});

answerSimilarity.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  answerSimilarity,
};