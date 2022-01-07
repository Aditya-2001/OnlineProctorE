const Quiz = require('../../models/quiz');
const User = require('../../models/user');
const Course = require('../../models/course');
const Question = require('../../models/question');
const Enrollment = require('../../models/enrollment');
const IllegalAttempt = require('../../models/illegalAttempt');
const QuestionSubmission = require('../../models/questionSubmission');
const multer = require('multer');
const {removeFile} = require('../../functions');
const XLSX = require('xlsx');
const path = require('path');
const config = require('../../config');
const Submission = require('../../models/submission');
const {answerSimilarity} = require('../../queues/answerSimilarity');
const {webPlagiarism} = require('../../queues/webPlagiarism');
const axios = require('axios');
const FormData = require('form-data');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/faculty');
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

const excelFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(xlsx|xlx)$/)) {
    return cb(new Error('You can upload only excel files!'), false);
  }
  cb(null, true);
};

exports.uploadExcelFile = multer({ storage: storage, fileFilter: excelFileFilter});

exports.authUserQuiz = async (req, res, next) => {
  const {quiz_id} = req.params;
  await User.findByToken(req.cookies.auth, async (err, user) => {
    if(err) return res.status(400).render('error/error');
    if(!user) return res.status(400).render('error/error');
    await Quiz.findOne({_id: quiz_id}, async (err, quiz) => {
      if(err) return res.status(400).render('error/error');
      if(!quiz) return res.status(400).render('error/error');
      await Course.findOne({_id: quiz.course._id, instructors: {$all: [user._id]}}, async (err, course) => {
        if(err) return res.status(400).render('error/error');
        if(!course) return res.status(400).render('error/error');
        req.quizId = quiz_id;
        next();
      }).clone().catch(function(err){console.log(err)});
    }).clone().catch(function(err){console.log(err)})
  })
}

exports.getCourseQuiz = async (req, res) => {
  const quizId = req.quizId;
  await Quiz.findOne({_id: quizId}, async (err, quiz) => {
    if(err) return res.status(400).render('error/error');
    await Question.find({quiz: quizId}, async (err, questions) => {
      if(err) return res.status(400).render('error/error');
      if(req.cookies.accountType == config.faculty){
        if(quiz.quizHeld){
          await Submission.find({quiz: quizId}, (err, submissions) => {
            return res.status(200).render('faculty/AfterExam', {
              quizId: quizId, 
              quiz: quiz, 
              questions: questions, 
              page: quiz.quizName,
              submissions: submissions
            });
          }).clone().catch(function(err){console.log(err)})
        }
        else{
          return res.status(200).render('faculty/BeforeExam', {quizId: quizId, quiz: quiz, questions: questions, page: quiz.quizName});
        }
      }
      else{
        await User.findByToken(req.cookies.auth, async (err, user) => {
          if(err) return res.status(400).render('error/error');
          if(!user) return res.status(400).render('error/error');
          await Enrollment.findOne({course: quiz.course._id, user: user._id}, async (err, enrolledUser) => {
            if(err) return res.status(400).render('error/error');
            if(!enrolledUser) return res.status(400).render('error/error');
            if(enrolledUser.accountType == config.student){
              await Submission.findOne({quiz: quizId, user: user._id}, async (err, submission) => {
                if(err) return res.status(400).render('error/error');
                if(!submission) return res.status(400).render('error/error');
                if(quiz.startDate <= Date.now() && Date.now() < quiz.endDate){
                  if(!submission.submitted && req.device.type == 'desktop'){
                    return res.status(200).render('quiz/quiz', {quizId: quizId, quiz: quiz, submission: submission});
                  }
                  else if(submission.submitted){
                    return res.status(200).render('quiz/viewQuiz', {quizId: quizId, quiz: quiz, submission: submission});
                  }
                  else{
                    return res.status(200).render('error/error');
                  }
                }
                else if(Date.now() >= quiz.endDate){
                  quiz.quizHeld = true;
                  quiz.save();
                  return res.status(200).render('quiz/viewQuiz', {quizId: quizId, quiz: quiz, submission: submission});
                }
                else{
                  return res.status(200).redirect('/dashboard/user/course/'+quiz.course._id);
                }
              }).clone().catch(function(err){console.log(err)})
            }
            else{
              if(quiz.quizHeld){
                await Submission.find({quiz: quizId}, (err, submissions) => {
                  return res.status(200).render('studentTa/AfterExam', {quizId: quizId, 
                    quiz: quiz, 
                    enrolledUser: enrolledUser, 
                    questions: questions, 
                    page: quiz.quizName,
                    submissions: submissions
                  });
                }).clone().catch(function(err){console.log(err)})
              }
              else{
                return res.status(200).render('studentTa/BeforeExam', {quizId: quizId, quiz: quiz, enrolledUser: enrolledUser, questions: questions, page: quiz.quizName});
              }
            }
          }).clone().catch(function(err){console.log(err)})
        })
      }
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
}

exports.addQuestions = (req, res) => {
  const quizId = req.quizId;
  const filePath = path.resolve(__dirname, '../../' + req.file.path);
  const workbook = XLSX.readFile(filePath);
  (async function() {
    const allSheets = workbook.SheetNames;
    for await (let i of allSheets){
      const questions = XLSX.utils.sheet_to_json(workbook.Sheets[i]);
      for await (let question of questions){
        const questionType = question["Question Type"];
        const quizQuestion = question["Question"];
        const maximumMarks = question["Maximum Marks"];
        var note = question["Note"];
        if(note == undefined){
          note = '';
        }
        if(questionType.toLowerCase() === "subjective"){
          var writtenQuestion = {quiz: quizId, question: quizQuestion, maximumMarks: maximumMarks, note: note};
          const newQuestion = new Question(writtenQuestion);
          await Question.findOne(writtenQuestion, (err, foundQuestion) => {
            if(err) console.log(err);
            if(foundQuestion) console.log('Question Already Exists');
            if(!foundQuestion) newQuestion.save();
          }).clone().catch(function(err){console.log(err)})
        }
        else{
          var options = [];
          const negativeMarking = question["Negative Marking"];
          const partialMarking = question["Partial Marking"];
          var markingScheme = true;
          if(partialMarking.toLowerCase() === "no"){
            markingScheme = false;
          }
          for(i=1; i<8; i++){
            if(question["Option"+i] != undefined){
              options.push(String(question["Option"+i]));
            }
            else{
              break;
            }
          }
          var correctOptions = [];
          String(question["Correct Options"]).split(',').forEach(option => {
            correctOptions.push(String(options[parseInt(option)-1]));
          })
          var mcqQuestion = {quiz: quizId, question: quizQuestion, maximumMarks: maximumMarks, note: note,
            mcq: true, options: options, correctOptions: correctOptions, markingScheme: markingScheme,
            negativeMarking: negativeMarking};
          const newQuestion = new Question(mcqQuestion);
          await Question.findOne(mcqQuestion, (err, foundQuestion) => {
            if(err) console.log(err);
            if(foundQuestion) console.log('Question Already Exists');
            if(!foundQuestion) newQuestion.save();
          }).clone().catch(function(err){console.log(err)})
        }
      }
    }
    removeFile(filePath);
    console.log(filePath);
    return res.status(200).redirect(req.get('referer'));
  })();
}

exports.hideQuiz = async (req, res) => {
  const quizId = req.quizId;
  await Quiz.findOne({_id: quizId}, (err, quiz) => {
    if(quiz.hidden){
      quiz.hidden = false;
    }
    else{
      quiz.hidden = true;
    }
    quiz.save();
    res.status(200).redirect(req.get('referer'));
  }).clone().catch(function(err){console.log(err)})
}

exports.disablePrevious = async (req, res) => {
  const quizId = req.quizId;
  await Quiz.findOne({_id: quizId}, (err, quiz) => {
    if(quiz.disablePrevious){
      quiz.disablePrevious = false;
    }
    else{
      quiz.disablePrevious = true;
    }
    quiz.save();
    res.status(200).redirect(req.get('referer'));
  }).clone().catch(function(err){console.log(err)})
}

exports.addWrittenQuestion = async (req, res) => {
  const quizId = req.quizId;
  const quizQuestion = req.body.question;
  const maximumMarks = req.body.maximumMarks;
  var note = req.body.note;
  if(note == undefined){
    note = '';
  }
  var writtenQuestion = {quiz: quizId, question: quizQuestion, maximumMarks: maximumMarks, note: note};
  const newQuestion = new Question(writtenQuestion);
  await Question.findOne(writtenQuestion, (err, foundQuestion) => {
    if(err) console.log(err);
    if(foundQuestion) console.log('Question Already Exists');
    if(!foundQuestion) newQuestion.save();
    res.status(200).redirect(req.get('referer'));
  }).clone().catch(function(err){console.log(err)})
}

exports.deleteQuiz = async (req, res) => {
  const quizId = req.quizId;
  const confirmation = req.body.confirmation;
  await Quiz.findOne({_id: quizId}, async (err, quiz) => {
    if(err) return res.status(400).render('error/error');
    if(!quiz) return res.status(400).render('error/error');
    if(confirmation == quizId){
      console.log(quiz.course);
      const courseId = quiz.course._id;
      quiz.remove();
      if(req.cookies.accountType == config.faculty){
        return res.status(200).redirect('/dashboard/faculty/course/' + courseId);
      }
      return res.status(200).redirect('/dashboard/user/course/' + courseId);
    }
    else{
      return res.status(200).redirect(req.get('referer'));
    }
  }).clone().catch(function(err){console.log(err)})
}

exports.addMCQQuestion = async (req, res) => {
  const quizId = req.quizId;
  const question = req.body.question;
  const maximumMarks = req.body.maximumMarks;
  const partialMarking = req.body.markingScheme;
  var markingScheme = true;
  if(partialMarking.toLowerCase() === "no"){
    markingScheme = false;
  }
  var options = [];
  if(req.body.option1)
    options.push(req.body.option1);
  if(req.body.option2)
    options.push(req.body.option2);
  if(req.body.option3)
    options.push(req.body.option3);
  if(req.body.option4)
    options.push(req.body.option4);
  var correctOptions = [];
  String(req.body.correctOptions).split(',').forEach(option => {
    correctOptions.push(String(options[parseInt(option)-1]));
  })
  var mcqQuestion = {quiz: quizId, question: question, maximumMarks: maximumMarks,
    mcq: true, options: options, correctOptions: correctOptions, markingScheme: markingScheme};
  const newQuestion = new Question(mcqQuestion);
  console.log(newQuestion);
  await Question.findOne(mcqQuestion, (err, foundQuestion) => {
    if(err) console.log(err);
    if(foundQuestion) console.log('Question Already Exists');
    if(!foundQuestion) newQuestion.save();
    return res.status(204).send();
  }).clone().catch(function(err){console.log(err)})
}

exports.viewDetailAnalysis = async (req, res) => {
  const quizId = req.quizId;
  await Quiz.findOne({_id: quizId}, async (err, quiz) => {
    await Submission.find({quiz: quizId}, (err, submissions) => {
      return res.status(200).render('faculty/viewDetailAnalysis', {quizId: quizId, quiz: quiz, submissions: submissions, page: quiz.quizName});
    }).clone().catch(function(err){console.log(err)});
  }).clone().catch(function(err){console.log(err)});
}

exports.deleteIllegalAttempts = async (req, res) => {
  const quizId = req.quizId;
  const confirmation = req.body.confirmation;
  await Quiz.findOne({_id: quizId}, async (err, quiz) => {
    if(err) return res.status(400).render('error/error');
    if(!quiz) return res.status(400).render('error/error');
    if(confirmation == quiz.quizName){
      await Submission.find({quiz: quizId}, async (err, submissions) => {
        for await (let submission of submissions){
          await IllegalAttempt.findOne({submission: submission._id}, (err, illegalAttempt) => {
            if(illegalAttempt)
              illegalAttempt.remove();
          }).clone().catch(function(err){console.log(err)})
        }
        quiz.illegalAttemptsPresent = false;
        quiz.save();
        return res.status(200).redirect(req.get('referer'));
      }).clone().catch(function(err){console.log(err)})
    }
    else{
      return res.status(200).redirect(req.get('referer'));
    }
  }).clone().catch(function(err){console.log(err)})
}

exports.generateScore = async (req, res) => {
  const quizId = req.quizId;
  await Submission.find({quiz: quizId}, async (err, submissions) => {
    for await (let submission of submissions){
      submission.mcqScore = 0;
      var marks = 0;
      await Question.find({quiz: quizId}, async (err, questions) => {
        for await (let question of questions) {
          if(question.mcq){
            await QuestionSubmission.findOne({submission: submission._id, question: question._id}, async (err, questionSubmission) => {
              if(questionSubmission){
                var count = 0;
                var wrong = false;
                for await (let option of questionSubmission.optionsMarked){
                  if(question.correctOptions.includes(option)){
                    count += 1;
                  }
                  else{
                    wrong = true;
                    break;
                  }
                }
                var questionMarks = 0;
                if(wrong){
                  questionMarks = question.negativeMarking;
                }
                else{
                  if(count == question.correctOptions.length){
                    questionMarks = question.maximumMarks;
                  }
                  else{
                    if(question.markingScheme){
                      questionMarks = (question.maximumMarks*count)/question.correctOptions.length;
                    }
                  }
                }
                questionSubmission.marksObtained = questionMarks;
                questionSubmission.checked = true;
                questionSubmission.save();
                submission.mcqScore += questionMarks;
                submission.save();
              }
            }).clone().catch(function(err){console.log(err)})
          }
        }
      }).clone().catch(function(err){console.log(err)})
    }
    return res.status(204).send();
  }).clone().catch(function(err){console.log(err)})
}

exports.generateSimilarityReport = async (req, res) => {
  const quizId = req.quizId;
  await Submission.find({quiz: quizId}, async (err, submissions) => {
    for await (let submission of submissions){
      await QuestionSubmission.find({submission: submission._id}, async (err, questionSubmissions) => {
        for await(let questionSubmission of questionSubmissions){
          if(questionSubmission && !questionSubmission.mcq && questionSubmission.textfield !== ''){
            answerSimilarity.add({id: questionSubmission._id});
          }
        }
      }).clone().catch(function(err){console.log(err)})
    }
    await Quiz.findOne({_id: quizId}, (err, quiz) => {
      quiz.studentAnswersMatched = true;
      quiz.save();
      return res.status(204).send();
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
}

exports.generatePlagiarismReport = async (req, res) => {
  const quizId = req.quizId;
  await Submission.find({quiz: quizId}, async (err, submissions) => {
    for await (let submission of submissions){
      await QuestionSubmission.find({submission: submission._id}, async (err, questionSubmissions) => {
        for await (let questionSubmission of questionSubmissions){
          if(questionSubmission && !questionSubmission.mcq && questionSubmission.textfield !== ''){
            webPlagiarism.add({id: questionSubmission._id});
          }
        }
      }).clone().catch(function(err){console.log(err)})
    }
    await Quiz.findOne({_id: quizId}, (err, quiz) => {
      quiz.webDetectionDone = true;
      quiz.save();
      return res.status(204).send();
    }).clone().catch(function(err){console.log(err)})
  }).clone().catch(function(err){console.log(err)})
}