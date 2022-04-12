// Packages
const ejs = require('ejs');
const XLSX = require('xlsx');
const path = require('path');
const pdf = require("html-pdf");
const multer = require('multer');
const Excel = require('exceljs');
const AdmZip = require('adm-zip');
const fs = require('fs').promises;
const schedule = require('node-schedule');

// Functions and Settings
const config = require('../../config');
const {removeFile} = require('../../functions');

// Models
const User = require('../../models/user');
const Quiz = require('../../models/quiz');
const Course = require('../../models/course');
const Question = require('../../models/question');
const AnswerPDF = require('../../models/answerPDF');
const Enrollment = require('../../models/enrollment');
const Submission = require('../../models/submission');
const LabQuestion = require('../../models/labQuestion');
const LabTestCase = require('../../models/labTestCase');
const LabSubmission = require('../../models/labSubmission');
const IllegalAttempt = require('../../models/illegalAttempt');
const QuestionSubmission = require('../../models/questionSubmission');

// Queues
const {webPlagiarism} = require('../../queues/webPlagiarism');
const {answerSimilarity} = require('../../queues/answerSimilarity');
const {generateStudentSubmission} = require('../../queues/generateStudentSubmission');

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
  try{
    const {quiz_id} = req.params;
    var user = await User.findOneUser(req.cookies.auth);
    var quiz = await Quiz.findOneQuiz({_id: quiz_id});
    var course = await Course.findOneCourse({_id: quiz.course._id, instructors: {$all: [user._id]}});
    if(!course) throw new Error('User is not a instructor in the Course');
    req.quizId = quiz_id;
    next();
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.getCourseQuiz = async (req, res) => {
  try{
    const quizId = req.quizId;
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    var questions = await Question.findQuestions({quiz: quiz._id});
    if(Date.now() >= quiz.endDate){
      quiz.quizHeld = true;
      quiz.save();
    }
    if(req.cookies.accountType == config.faculty){
      var data = {
        quizId: quizId, 
        quiz: quiz, 
        questions: questions, 
        page: quiz.quizName,
        backLink: '/dashboard/faculty/course/' + quiz.course._id
      }
      if(quiz.quizHeld){
        return res.status(200).render('faculty/AfterExam', data);
      }
      else{
        return res.status(200).render('faculty/BeforeExam', data);
      }
    }
    var user = await User.findOneUser(req.cookies.auth);
    var enrolledUser = await Enrollment.findOneEnrollment({course: quiz.course._id, user: user._id});
    if(enrolledUser.accountType == config.student){
      var submission = await Submission.findOneSubmission({quiz: quizId, user: user._id});
      var data = {
        quizId: quizId, 
        quiz: quiz, 
        submission: submission,
        backLink: '/dashboard/user/course/' + quiz.course._id
      }
      if(quiz.startDate <= Date.now() && Date.now() < quiz.endDate){
        if(!submission.submitted && req.device.type == 'desktop'){
          // if(quiz.labQuiz)
          //   return res.status(200).render('labPage/labpage', data);
          return res.status(200).render('quiz/quiz', data);
        }
        else if(submission.submitted){
          return res.status(200).render('quiz/viewQuiz', data);
        }
        throw new Error('Invalid access to Quiz by User');
      }
      else if(Date.now() >= quiz.endDate){
        return res.status(200).render('quiz/viewQuiz', data);
      }
      return res.status(200).redirect('/dashboard/user/course/' + quiz.course._id);
    }
    var data = {
      quizId: quizId, 
      quiz: quiz, 
      enrolledUser: enrolledUser, 
      questions: questions, 
      page: quiz.quizName,
      backLink: '/dashboard/user/course/' + quiz.course._id
    }
    if(quiz.quizHeld){
      data.submissions = submissions;
      return res.status(200).render('studentTa/AfterExam', data);
    }
    return res.status(200).render('studentTa/BeforeExam', data);
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.addQuestions = async (req, res) => {
  const quizId = req.quizId;
  const filePath = path.resolve(__dirname, '../../' + req.file.path);
  const workbook = XLSX.readFile(filePath);
  const allSheets = workbook.SheetNames;
  for await (let i of allSheets){
    const questions = XLSX.utils.sheet_to_json(workbook.Sheets[i]);
    for await (let question of questions){
      try{
        var quiz = await Quiz.findOneQuiz({_id: quizId});
        const questionType = question["Question Type"];
        const quizQuestion = question["Question"];
        const maximumMarks = question["Maximum Marks"];
        const set = question["Set"];
        if(!quiz.setNames.includes(set)){
          quiz.setNames.push(set);
          quiz.setCount += 1;
        }
        var note = question["Note"];
        if(note == undefined){
          note = '';
        }
        var count = 1;
        var imageLinks = [];
        while(question["ImageLink"+count]){
          if(question["ImageLink"+count] != ''){
            imageLinks.push(String(question["ImageLink"+count]));
            count += 1;
          }
        }
        if(questionType.toLowerCase() === "subjective"){
          const pdfUpload = question["PdfUpload"].toLowerCase() == 'yes' ? true : false;
          var writtenQuestion = {quiz: quizId, set: set, question: quizQuestion, maximumMarks: maximumMarks, note: note, imageLinks: imageLinks, pdfUpload: pdfUpload};
          const newQuestion = await new Question(writtenQuestion);
          var foundQuestion = await Question.findOneQuestion(writtenQuestion);
          if(foundQuestion) throw new Error('Question Already Exists');
          newQuestion.save();
          if(pdfUpload){
            quiz.pdfUpload = quiz.pdfUpload || pdfUpload;
            quiz.pdfUploadQuestionCount += 1;
          }
        }
        else{
          var options = [];
          const negativeMarking = question["Negative Marking"];
          const partialMarking = question["Partial Marking"];
          var markingScheme = true;
          if(partialMarking.toLowerCase() === "no"){
            markingScheme = false;
          }
          var optionCount = 1;
          while(String(question["Option"+optionCount])!= 'undefined'){
            options.push(String(question["Option"+optionCount]));
            optionCount += 1;
          }
          var correctOptions = [];
          String(question["Correct Options"]).split(',').forEach(option => {
            correctOptions.push(String(options[parseInt(option)-1]));
          })
          var mcqQuestion = {quiz: quizId, set: set, question: quizQuestion, maximumMarks: maximumMarks, note: note,
            mcq: true, options: options, correctOptions: correctOptions, markingScheme: markingScheme,
            negativeMarking: negativeMarking, imageLinks: imageLinks};
          const newQuestion = await new Question(mcqQuestion);
          var foundQuestion = await Question.findOneQuestion(mcqQuestion);
          if(foundQuestion) throw new Error('Question Already Exists');
          newQuestion.save();
        }
        quiz.save();
      }
      catch(err){
        console.log(err);
        continue;
      }
    }
  }
  await removeFile(filePath);
  return res.status(200).redirect(req.get('referer'));
}

exports.hideQuiz = async (req, res) => {
  try{
    const quizId = req.quizId;
    var quiz = await Quiz.findOne({_id: quizId});
    quiz.hidden = (quiz.hidden == true?false:true);
    quiz.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.disablePrevious = async (req, res) => {
  try{
    const quizId = req.quizId;
    var quiz = await Quiz.findOne({_id: quizId});
    quiz.disablePrevious = (quiz.disablePrevious == true?false:true);
    quiz.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.deleteQuiz = async (req, res) => {
  const quizId = req.quizId;
  const confirmation = req.body.confirmation;
  var quiz = await Quiz.findOneQuiz({_id: quizId});
  if(confirmation == quizId){
    const courseId = quiz.course._id;
    quiz.remove();
    if(req.cookies.accountType == config.faculty){
      return res.status(200).redirect('/dashboard/faculty/course/' + courseId);
    }
    return res.status(200).redirect('/dashboard/user/course/' + courseId);
  }
  return res.status(200).redirect(req.get('referer'));
}

exports.addWrittenQuestion = async (req, res) => {
  try{
    const quizId = req.quizId;
    const quizQuestion = req.body.question;
    const maximumMarks = req.body.maximumMarks;
    const set = req.body.set;
    const pdfUpload = req.body.pdfUpload == 'on' ? true : false;
    var note = req.body.note;
    if(note == undefined){
      note = '';
    }
    var count = 1;
    var imageLinks = [];
    while(req.body['imageLink'+count]){
      if(req.body['imageLink'+count] != ''){
        imageLinks.push(req.body['imageLink'+count]);
        count += 1;
      }
    }
    var writtenQuestion = {quiz: quizId, set: set, question: quizQuestion, maximumMarks: maximumMarks, note: note, imageLinks: imageLinks, pdfUpload: pdfUpload};
    const newQuestion = new Question(writtenQuestion);
    var quiz = await Quiz.findOne({_id: quizId});
    if(!quiz.setNames.includes(set)){
      quiz.setNames.push(set);
      quiz.setCount += 1;
    }
    quiz.pdfUpload = quiz.pdfUpload || pdfUpload;
    if(pdfUpload){
      quiz.pdfUploadQuestionCount += 1;
    }
    quiz.save();
    var foundQuestion = await Question.findOneQuestion(writtenQuestion);
    if(foundQuestion) throw new Error('Question Already Exists');
    newQuestion.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.addMCQQuestion = async (req, res) => {
  try{
    const quizId = req.quizId;
    const question = req.body.question;
    console.log(question);
    const maximumMarks = req.body.maximumMarks;
    const partialMarking = req.body.markingScheme;
    const set = req.body.set;
    var negativeMarking = 0;
    var markingScheme = true;
    if(partialMarking.toLowerCase() === "no"){
      markingScheme = false;
    }
    var options = [];
    var count = 1;
    while(req.body['option'+count]){
      if(req.body['option'+count] != ''){
        options.push(req.body['option'+count]);
        count += 1;
      }
    }
    count = 1;
    var imageLinks = [];
    while(req.body['imageLink'+count]){
      if(req.body['imageLink'+count] != ''){
        imageLinks.push(req.body['imageLink'+count]);
        count += 1;
      }
    }
    if(req.body.negativeMarking)
      negativeMarking = req.body.negativeMarking;
    var correctOptions = [];
    String(req.body.correctOptions).split(',').forEach(option => {
      correctOptions.push(String(options[parseInt(option)-1]));
    })
    var mcqQuestion = {quiz: quizId, set: set, question: question, maximumMarks: maximumMarks,
      mcq: true, options: options, correctOptions: correctOptions, markingScheme: markingScheme,
      negativeMarking: negativeMarking, imageLinks: imageLinks};
    const newQuestion = new Question(mcqQuestion);
    var foundQuestion = await Question.findOneQuestion(mcqQuestion);
    if(foundQuestion) throw new Error('Question Already Exists');
    var quiz = await Quiz.findOne({_id: quizId});
    if(!quiz.setNames.includes(set)){
      quiz.setNames.push(set);
      quiz.setCount += 1;
      quiz.save();
    }
    newQuestion.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.viewDetailAnalysis = async (req, res) => {
  try{
    const quizId = req.quizId;
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    var submissions = await Submission.findSubmissions({quiz: quiz._id});
    var backLink = '/dashboard/user/quiz/' + quiz._id;
    if(req.cookies.accountType == config.faculty){
      backLink = '/dashboard/faculty/quiz/' + quiz._id;
    }
    return res.status(200).render('faculty/viewDetailAnalysis', {
      quizId: quizId, 
      quiz: quiz, 
      submissions: submissions, 
      page: quiz.quizName,
      backLink: backLink
    });
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.viewDetailAnalysisData = async (req, res) => {
  try{
    const quizId = req.quizId;
    var submissions = await Submission.findSubmissions({quiz: quizId});
    return res.status(200).json({
      submissions: submissions
    });
  }
  catch(err){
    console.log(err);
    return res.status(400).render('error/error');
  }
}

exports.deleteIllegalAttempts = async (req, res) => {
  try{
    const quizId = req.quizId;
    const confirmation = req.body.confirmation;
    var quiz = await Quiz.findOneQuiz({_id: quizId});
    if(confirmation == quiz.quizName){
      var submissions = await Submission.findSubmissions({quiz: quizId});
      for await (let submission of submissions){
        var illegalAttempts = await IllegalAttempt.findIllegalAttempts({submission: submission._id});
        for await(let illegalAttempt of illegalAttempts){
          illegalAttempt.remove();
        }
        quiz.illegalAttemptsPresent = false;
        quiz.save();
      }
    }
  }
  catch(err){
    console.log(err);
  }
  return res.status(200).redirect(req.get('referer'));
}

exports.generateScore = async (req, res) => {
  const quizId = req.quizId;
  var submissions = await Submission.findSubmissions({quiz: quizId});
  var questions = await Question.findQuestions({quiz: quizId});
  for await (let submission of submissions){
    submission.mcqScore = 0;
    for await (let question of questions) {
      try{
        if(!question.mcq) continue;
        var questionSubmission = await QuestionSubmission.findOneQuestionSubmission({submission: submission._id, question: question._id});
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
          questionMarks = -question.negativeMarking;
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
      catch(err){
        continue;
      }
    }
  }
  return res.status(204).send();
}

exports.generateSimilarityReport = async (req, res) => {
  try{
    const quizId = req.quizId;
    var submissions = await Submission.findSubmissions({quiz: quizId});
    for await (let submission of submissions){
      var questionSubmissions = await QuestionSubmission.findQuestionSubmissions({submission: submission._id});
      for await(let questionSubmission of questionSubmissions){
        if(questionSubmission && !questionSubmission.mcq && questionSubmission.textfield !== ''){
          answerSimilarity.add({id: questionSubmission._id});
        }
      }
    }
    var quiz = await Quiz.findOne({_id: quizId});
    quiz.studentAnswersMatched = true;
    quiz.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.generatePlagiarismReport = async (req, res) => {
  try{
    const quizId = req.quizId;
    var submissions = await Submission.findSubmissions({quiz: quizId});
    for await (let submission of submissions){
      var questionSubmissions = await QuestionSubmission.findQuestionSubmissions({submission: submission._id});
      for await (let questionSubmission of questionSubmissions){
        if(questionSubmission && !questionSubmission.mcq && questionSubmission.textfield !== '' && !questionSubmission.webDetectionDone){
          webPlagiarism.add({id: questionSubmission._id});
        }
      }
    }
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.deleteQuestion = async (req, res) => {
  var question = await Question.findOne({_id: req.body.id});
  if(!question.mcq && question.pdfUpload){
    var quiz = await Quiz.findOne({_id: req.quizId});
    quiz.pdfUploadQuestionCount -= 1;
    if(quiz.pdfUploadQuestionCount == 0){
      quiz.pdfUpload = false;
    }
    quiz.save();
  }
  question.remove();
  return res.status(204).send();
}

exports.editMCQQuestion = async (req, res) => {
  try{
    const questionId = req.body.questionId;
    const questionText = req.body.question;
    const maximumMarks = req.body.maximumMarks;
    const partialMarking = req.body.markingScheme;
    const set = req.body.set;
    var negativeMarking = 0;
    var markingScheme = true;
    if(partialMarking.toLowerCase() === "no"){
      markingScheme = false;
    }
    var options = [];
    var count = 1;
    while(req.body['option'+count]){
      if(req.body['option'+count] != ''){
        options.push(req.body['option'+count]);
        count += 1;
      }
    }
    count = 1;
    var imageLinks = [];
    while(req.body['imageLink'+count]){
      if(req.body['imageLink'+count] != ''){
        imageLinks.push(req.body['imageLink'+count]);
        count += 1;
      }
    }
    if(req.body.negativeMarking)
      negativeMarking = req.body.negativeMarking;
    var correctOptions = [];
    String(req.body.correctOptions).split(',').forEach(option => {
      correctOptions.push(String(options[parseInt(option)-1]));
    })
    var question = await Question.findOne({_id: questionId});
    question.question = questionText;
    question.maximumMarks = maximumMarks;
    question.options = options;
    question.set = set;
    question.correctOptions = correctOptions;
    question.markingScheme = markingScheme;
    question.negativeMarking = negativeMarking;
    question.imageLinks = imageLinks;
    question.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.editWrittenQuestion = async (req, res) => {
  try{
    const questionId = req.body.questionId;
    const quizQuestion = req.body.question;
    const maximumMarks = req.body.maximumMarks;
    const pdfUpload = req.body.pdfUpload == 'on' ? true : false;
    var note = req.body.note;
    const set = req.body.set;
    if(note == undefined){
      note = '';
    }
    var count = 1;
    var imageLinks = [];
    while(req.body['imageLink'+count]){
      if(req.body['imageLink'+count] != ''){
        imageLinks.push(req.body['imageLink'+count]);
        count += 1;
      }
    }
    var quiz = await Quiz.findOne({_id: req.quizId});
    var question = await Question.findOne({_id: questionId});
    question.question = quizQuestion;
    question.note = note;
    question.set = set;
    question.maximumMarks = maximumMarks;
    question.imageLinks = imageLinks;
    if(question.pdfUpload && !pdfUpload){
      quiz.pdfUploadQuestionCount -= 1;
    }
    else if(!question.pdfUpload && pdfUpload){
      quiz.pdfUploadQuestionCount += 1;
    }
    if(quiz.pdfUploadQuestionCount == 0){
      quiz.pdfUpload = false;
    }
    else{
      quiz.pdfUpload = true;
    }
    quiz.save();
    question.pdfUpload = pdfUpload;
    question.save();
  }
  catch(err){
    console.log(err);
  }
  return res.status(204).send();
}

exports.editCourseQuiz = async (req, res) => {
  const quizId = req.quizId;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  var quiz = await Quiz.findOne({_id: quizId});
  quiz.startDate = startDate;
  quiz.endDate = endDate;
  quiz.save();
  const job = schedule.scheduleJob(startDate.getTime() - 20000, async function(){
    console.log('The world is going to end today.');
    assignSets(String(quiz._id));
  });
  return res.status(204).send();
}

exports.viewStream = async (req, res) => {
  var submission = await Submission.findOneSubmission({_id: req.submissionId});
  var backLink = '/dashboard/user/quiz/' + submission.quiz._id + '/viewDetailAnalysis';
  if(req.cookies.accountType == config.faculty)
    backLink = '/dashboard/faculty/quiz/' + submission.quiz._id + '/viewDetailAnalysis';
  return res.status(200).render('videoStreaming/stream', {
    submission: submission,
    backLink: backLink
  });
}

//unmodified and unoptimized
exports.downloadQuizResults = async (req, res) => {
  await Quiz.findOne({_id: req.quizId}, async (err, quiz) => {
    const fileName = quiz.quizName+'.zip';
    const fileType = 'application/zip';
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Transfer-Encoding': 'chunked',
      'Content-Type': fileType,
    });
    const workbook = new Excel.Workbook();
    var zip = new AdmZip();
    let sets = quiz.setNames.map(function(set, index){
      return new Promise(async function(resolve){
        var worksheet = workbook.addWorksheet('Set '+set);
        await Question.find({quiz: quiz._id, set: set}, async (err, questions) => {
          let header = ['UserName', 'Total Marks', 'Set', 'Browser Switched', 'Multiple Person', 'Audio Detected', 'Mobile Detected', 'No Person'];
          let questionPromises = questions.map(function(question, index) {
            return new Promise(function(resolve) {
              header.push('Q'+(index+1)+'('+question.maximumMarks+')');
              resolve();
            })
          })
          Promise.all(questionPromises).then(async function(){
            worksheet.addRow(header).commit();
            await Submission.find({quiz: quiz._id, set: set}, async (err, submissions) => {
              let submissionPromises = submissions.map(function(submission, index){
                return new Promise(async function(resolve){
                  var username = submission.user.username;
                  var totalMarks = submission.mcqScore + submission.writtenScore;
                  var set = submission.set;
                  var browserSwitched = submission.browserSwitched;
                  var multiplePerson = submission.multiplePerson;
                  var audioDetected = submission.audioDetected;
                  var mobileDetected = submission.mobileDetected;
                  var noPerson = submission.noPerson;
                  let row = [username, totalMarks, set, browserSwitched, multiplePerson, audioDetected, mobileDetected, noPerson];
                  let addQuestionPromises = questions.map(function(question, index){
                    return new Promise(async function(resolve){
                      await QuestionSubmission.findOne({submission: submission._id, question: question._id}, async (err, questionSubmission) => {
                        row.push(questionSubmission.marksObtained);
                        resolve();
                      }).clone().catch(function(err){console.log(err)});
                    });
                  });
                  Promise.all(addQuestionPromises).then(function(){
                    worksheet.addRow(row).commit();
                    resolve();
                  });
                })
              })
              Promise.all(submissionPromises).then(async function(){
                var images = {};
                let getImages = questions.map(async function(question, index){
                  return new Promise(function(resolve){
                    images[question._id] = [];
                    let addImages = question.imageLinks.map(function(link, index){
                      return new Promise(async function(resolve){
                        // const id = link.split('/').reverse()[1];
                        // const response = await axios.get('https://drive.google.com/uc?export=view&id='+id,  { responseType: 'arraybuffer' })
                        // const buffer = 'data:image/;base64,' + Buffer.from(response.data, "utf-8").toString('base64');
                        // images[question._id].push(buffer);
                        images[question._id].push(link);
                        resolve();
                      })
                    })
                    Promise.all(addImages).then(function(){
                      resolve();
                    })
                  })
                })
                Promise.all(getImages).then(function(){
                  ejs.renderFile(path.resolve(__dirname,'../../views/facultyQuiz/questionPaper.ejs'), {
                    questions: questions,
                    images: images
                  }, async function(err, data){
                    let options = {
                      "height": "11.25in",
                      "width": "8.5in",
                      "header": {
                        "height": "20mm"
                      },
                      "footer": {
                        "height": "20mm",
                      },
                    };
                    pdf.create(data, options).toBuffer(function(err, buffer){
                      zip.addFile(String(quiz.quizName+"_Set "+set+"_"+String(quiz._id)+".pdf"), Buffer.from(buffer, "utf8"));
                      resolve();
                    });
                  })
                })
              })
            }).clone().catch(function(err){console.log(err)});
          })
        }).clone().catch(function(err){console.log(err)});
      })
    })
    Promise.all(sets).then(async function(){
      let excelFile = workbook.xlsx.writeFile('./'+quiz.quizName+'_'+quiz._id+'.xlsx');
      excelFile.then(async () => {
        await zip.addLocalFile(path.resolve(__dirname,'../../'+quiz.quizName+'_'+quiz._id+'.xlsx'));
        removeFile(path.resolve(__dirname,'../../'+quiz.quizName+'_'+quiz._id+'.xlsx'));
        var zipFileContents = await zip.toBuffer();
        res.end(zipFileContents);
        return;
      })
    })
  }).clone().catch(function(err){console.log(err)});
}

//unmodified and unoptimized
exports.downloadStudentSubmissions = async (req, res) => {
  await Submission.find({quiz: req.quizId}, async (err, submissions) => {
    var q = await Quiz.findOne({_id: req.quizId});
    const fileName = q.quizName + ' Submissions.zip';
    const fileType = 'application/zip';
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Transfer-Encoding': 'chunked',
      'Content-Type': fileType,
    });
    var zip = new AdmZip();
    let submissionGeneration = submissions.map(function(submission, index){
      return new Promise(async function(resolve){
        await QuestionSubmission.find({submission: submission._id}, async (err, questionSubmissions) => {
          await Submission.find({quiz: submission.quiz._id, ipAddress: submission.ipAddress}, (err, present) => {
            var maxPlag = 0;
            for(let i=0; i < questionSubmissions.length; i++){
              maxPlag = Math.max(questionSubmissions[i].webSource.plagiarismPercent, maxPlag);
            }
            var unique = 'No';
            if(present.length > 1){
              for(let i=0; i<present.length; i++){
                present[i].usingSomeoneElseIP = false;
                present[i].save();
              }
            }
            else{
              for(let i=0; i<present.length; i++){
                present[i].usingSomeoneElseIP = true;
                present[i].save();
              }
              unique = 'Yes';
            }
            var images = {};
            let getImages = questionSubmissions.map(async function(questionSubmission, index){
              return new Promise(function(resolve){
                images[questionSubmission._id] = [];
                let addImages = questionSubmission.question.imageLinks.map(function(link, index){
                  return new Promise(async function(resolve){
                    // const id = link.split('/').reverse()[1];
                    // const response = await axios.get('https://drive.google.com/uc?export=view&id='+id,  { responseType: 'arraybuffer' })
                    // const buffer = 'data:image/;base64,' + Buffer.from(response.data, "utf-8").toString('base64');
                    // images[questionSubmission._id].push(buffer);
                    images[questionSubmission._id].push(link);
                    resolve();
                  })
                })
                Promise.all(addImages).then(function(){
                  resolve();
                })
              })
            })
            Promise.all(getImages).then(async function(){
              ejs.renderFile(path.resolve(__dirname,'../../views/facultyQuiz/pdfSubmission.ejs'), {
                maxPlag: maxPlag, 
                submission: submission, 
                questionSubmissions: questionSubmissions, 
                page: submission.user.username.toUpperCase(), 
                unique: unique,
                images: images
              }, function(err, data){
                let options = {
                  "height": "11.25in",
                  "width": "8.5in",
                  "header": {
                    "height": "20mm"
                  },
                  "footer": {
                    "height": "20mm",
                  },
                };
                pdf.create(data, options).toBuffer(function(err, buffer){
                  if(submission.pdfUploaded){
                    AnswerPDF.findOne({submission: submission._id}, (err, answerPdf) => {
                      zip.addFile(String(submission.user.username.toUpperCase()+"_HTML_Answers.pdf"), Buffer.from(buffer, "utf8"));
                      zip.addFile(String(submission.user.username.toUpperCase()+"_Uploaded_PDF.pdf"), Buffer.from(answerPdf.uploadedfile.data, "utf8"));
                      resolve();
                    })
                  }
                  else{
                    zip.addFile(String(submission.user.username.toUpperCase()+"_"+String(submission.quiz._id)+".pdf"), Buffer.from(buffer, "utf8"));
                    resolve();
                  }
                });
              })
            })
          }).clone().catch(function(err){console.log(err)})
        }).clone().catch(function(err){console.log(err)})
      })
    })
    Promise.all(submissionGeneration).then(async () => {
      var zipFileContents = await zip.toBuffer();
      res.end(zipFileContents);
      return;
    })
  }).clone().catch(function(err){console.log(err)});
}


assignSets = async (quizId) => {
  console.log(quizId);
  var quiz = await Quiz.findOneQuiz({_id: quizId});
  var enrollments = await Enrollment.findEnrollments({course: quiz.course._id, accountType: config.student});
  for(var i=0; i<enrollments.length; i++){
    if(quiz.labQuiz){
      var labSubmission = await LabSubmission.exists({quiz: quizId, user: enrollments[i].user._id});
      if(labSubmission)
        continue;
      await LabSubmission.create({quiz: quizId, user: enrollments[i].user._id});
    }
    else{
      var submission = await Submission.exists({quiz: quizId, user: enrollments[i].user._id});
      if(submission)
        continue;
      await Submission.create({quiz: quizId, user: enrollments[i].user._id});
    }
  }
  if(quiz.labQuiz)
    return;
  if(Date.now() >= quiz.startDate){
    return;
  }
  var submissions = await Submission.findSubmissions({quiz: quizId});
  let currentIndex = submissions.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [submissions[currentIndex], submissions[randomIndex]] = [submissions[randomIndex], submissions[currentIndex]];
  }
  var k = Math.floor(submissions.length/quiz.setCount);
  var j = 0;
  for(let i=0; i<submissions.length; i++){
    if(i%k == 0){
      j += 1;
      j %= quiz.setCount;
    }
    submissions[i].set = quiz.setNames[j];
    submissions[i].save();
    generateStudentSubmission.add({submissionId: submissions[i]._id, quizId: quiz._id});
  }
}
exports.assignSets = assignSets;

exports.renderPreviewQuiz = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  return res.status(200).render('facultyQuiz/previewQuiz', {quizId: req.quizId, quiz: quiz});
}

exports.previewQuiz = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  var questions = await Question.findQuestions({quiz: quiz._id});
  return res.status(200).json({quiz: quiz, questions: questions});
}

exports.faceDetectorSetting = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.faceDetector = !quiz.faceDetector;
  quiz.save();
  return res.status(204).send();
}

exports.headPoseDetectorSetting = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.headPoseDetector = !quiz.headPoseDetector;
  quiz.save();
  return res.status(204).send();
}

exports.mobileDetectorSetting = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.mobileDetector = !quiz.mobileDetector;
  quiz.save();
  return res.status(204).send();
}

exports.tabSwitchDetectorSetting = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.tabSwitchDetector = !quiz.tabSwitchDetector;
  quiz.save();
  return res.status(204).send();
}

exports.ipAddressDetectorSetting = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.ipAddressDetector = !quiz.ipAddressDetector;
  quiz.save();
  return res.status(204).send();
}

exports.audioDetectorSetting = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.audioDetector = !quiz.audioDetector;
  quiz.save();
  return res.status(204).send();
}

exports.pdfUploadDuration = async (req, res) => {
  var quiz = await Quiz.findOneQuiz({_id: req.quizId});
  quiz.pdfUploadDuration = req.body.pdfUploadDuration;
  quiz.save();
  return res.status(204).send();
}

const testCaseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/faculty');
  },

  filename: async function (req, file, cb) {
    fileName = req.quizId + '_' +file.originalname;
    cb(null, fileName);
  }
});

const testCaseFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(txt)$/)) {
    return cb(new Error('You can upload only txt files!'), false);
  }
  cb(null, true);
};

exports.uploadTestCases = multer({ storage: testCaseStorage, fileFilter: testCaseFileFilter});

exports.addLabQuestion = async (req, res) => {
  try{
    const body = req.body;
    const question = body.question;
    const maximumMarks = body.maximumMarks;
    var count = 1;
    var imageLinks = [];
    while(body['imageLink'+count]){
      if(body['imageLink'+count] != ''){
        imageLinks.push(body['imageLink'+count]);
        count += 1;
      }
    }
    count = 1;
    var constraints = [];
    while(body['constraint'+count]){
      if(body['constraint'+count] != ''){
        constraints.push(body['constraint'+count]);
        count += 1;
      }
    }
    const sampleInputTestCase = body.sampleInputTestCase;
    const sampleOutputTestCase = body.sampleOutputTestCase;
    const sampleTestCaseExplanation = body.sampleTestCaseExplanation;
    count = 1;
    var explanationImageLinks = [];
    while(body['explanationImageLink'+count]){
      if(body['explanationImageLink'+count] != ''){
        explanationImageLinks.push(body['explanationImageLink'+count]);
        count += 1;
      }
    }
    var sampleTestCaseGiven = false;
    if(sampleInputTestCase.length){
      sampleTestCaseGiven = true;
    }
    var sampleTestCaseExplanationGiven = false;
    if(sampleTestCaseExplanation.length){
      sampleTestCaseExplanationGiven = true;
    }
    var labQuestion = {quiz: req.quizId, question: question, questionImageLinks: imageLinks, 
      maximumMarks: maximumMarks, constraints: constraints, sampleTestCaseGiven: sampleTestCaseGiven,
      sampleInputTestCase: sampleInputTestCase, sampleOutputTestCase: sampleOutputTestCase, 
      sampleTestCaseExplanationGiven: sampleTestCaseExplanationGiven, sampleTestCaseExplanation: sampleTestCaseExplanation,
      explanationImageLinks: explanationImageLinks}
    var foundQuestion = await LabQuestion.findOneLabQuestion(labQuestion);
    if(foundQuestion) throw new Error('Question Already Exists');
    const newQuestion = new LabQuestion(labQuestion);
    newQuestion.save();
    var files = req.files;
    for(var i=1; i<=files.length/2; i++){
      var inputTestCase = await files.find(file => file.filename.toLowerCase() == String(req.quizId + '_' + 'TestCase' + i + '.txt').toLowerCase());
      var outputTestCase = await files.find(file => file.filename.toLowerCase() == String(req.quizId + '_' + 'Output' + i + '.txt').toLowerCase());
      var inputTestCasePath = path.resolve(__dirname, "../../" + inputTestCase.path);
      var outputTestCasePath = path.resolve(__dirname, "../../" + outputTestCase.path);
      var inputData = await fs.readFile(inputTestCasePath, 'utf8');
      var outputData = await fs.readFile(outputTestCasePath, 'utf8');
      var testCase = {labQuestion: String(newQuestion._id), testCaseInput: {data: inputData, filename: inputTestCase.filename},
        testCaseOutput: {data: outputData, filename: outputTestCase.filename}};
      var foundTestCases = await LabTestCase.findOneLabTestCase(testCase);
      if(foundTestCases) continue;
      var newTestCase = new LabTestCase(testCase);
      newTestCase.save();
    }
  }catch(e){
    console.log(e);
  }
  return res.status(200).redirect(req.get('referer'));
}