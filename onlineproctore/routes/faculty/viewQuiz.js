const express = require('express');
const router = express.Router();

const {getCourseQuiz, addQuestions, uploadExcelFile, 
  hideQuiz, disablePrevious, generateScore, 
  generateSimilarityReport, generatePlagiarismReport, 
  addWrittenQuestion, deleteQuiz, deleteIllegalAttempts, 
  addMCQQuestion, viewDetailAnalysis, deleteQuestion,
  editMCQQuestion, editWrittenQuestion, editCourseQuiz,
  addLabQuestion, uploadTestCases,
  viewStream, downloadQuizResults, downloadStudentSubmissions,
  renderPreviewQuiz, previewQuiz, faceDetectorSetting,
  mobileDetectorSetting, tabSwitchDetectorSetting, ipAddressDetectorSetting,
  audioDetectorSetting, viewDetailAnalysisData, headPoseDetectorSetting,
  pdfUploadDuration} = require('../../controllers/faculty/viewEachQuiz');

const {getQuestions, markAnswer, submit, endTest, 
  ipAddress, audio, windowBlurred, screenSharingOff, 
  tabChanged, mobileDetected, multipleFace, noPerson, 
  getTime, getQuizDetectionSettings, headPoseDetection,
  givingQuiz, exitingQuiz, uploadPDF, uploadPDFFile,
  downloadSubmission, runCode, submitCode} = require('../../controllers/studentTa/quiz');

const {authFacultyTaQuiz, authStudentQuiz, authFacultyTaQuizAnalysis} = require('../../controllers/studentTa/courses');

const {getUserSubmission, updateMarks, getIllegalActivities} = require('../../controllers/studentTa/detailAnalysis');

router.route('/')
  .get(getCourseQuiz);

router.route('/addQuestions')
  .post([uploadExcelFile.single('excelFile'), authFacultyTaQuiz], addQuestions)

router.route('/hideQuiz')
  .get(authFacultyTaQuiz, hideQuiz)

router.route('/previewQuiz')
  .get(authFacultyTaQuiz, renderPreviewQuiz)
  .post(authFacultyTaQuiz, previewQuiz)

router.route('/downloadQuizResults')
  .get(authFacultyTaQuiz, downloadQuizResults)

router.route('/downloadStudentSubmissions')
  .get(authFacultyTaQuiz, downloadStudentSubmissions)

router.route('/viewDetailAnalysis')
  .get(authFacultyTaQuiz, viewDetailAnalysis)
  .post(authFacultyTaQuiz, viewDetailAnalysisData)

router.route('/viewDetailAnalysis/submission/:submissionId')
  .get(authFacultyTaQuizAnalysis, getUserSubmission)

router.route('/viewDetailAnalysis/submission/:submissionId/downloadSubmission/:studentsubmissionId')
  .get(authFacultyTaQuizAnalysis, downloadSubmission)

router.route('/viewDetailAnalysis/viewStream/submission/:submissionId')
  .get(authFacultyTaQuizAnalysis, viewStream)

router.route('/viewDetailAnalysis/submission/:submissionId/updateMarks')
  .post(authFacultyTaQuizAnalysis, updateMarks)

router.route('/viewDetailAnalysis/submission/:submissionId/illegalActivities')
  .get(authFacultyTaQuizAnalysis, getIllegalActivities)

router.route('/disablePrevious')
  .get(authFacultyTaQuiz, disablePrevious)

router.route('/generateScore')
  .get(authFacultyTaQuiz, generateScore)

router.route('/generateSimilarityReport')
  .get(authFacultyTaQuiz, generateSimilarityReport)

router.route('/generatePlagiarismReport')
  .get(authFacultyTaQuiz, generatePlagiarismReport)

router.route('/addWrittenQuestion')
  .post(authFacultyTaQuiz, addWrittenQuestion)

router.route('/addMCQQuestion')
  .post(authFacultyTaQuiz, addMCQQuestion)

router.route('/addLabQuestion')
  .post([uploadTestCases.array('TestCases'), authFacultyTaQuiz], addLabQuestion)

router.route('/editMCQQuestion')
  .post(authFacultyTaQuiz, editMCQQuestion)

router.route('/editWrittenQuestion')
  .post(authFacultyTaQuiz, editWrittenQuestion)

router.route('/editCourseQuiz')
  .post(authFacultyTaQuiz, editCourseQuiz)

router.route('/pdfUploadDuration')
  .post(authFacultyTaQuiz, pdfUploadDuration)

router.route('/deleteQuiz')
  .post(authFacultyTaQuiz, deleteQuiz)

router.route('/deleteQuestion')
  .post(authFacultyTaQuiz, deleteQuestion)

router.route('/faceDetectorSetting')
  .post(authFacultyTaQuiz, faceDetectorSetting)

router.route('/headPoseDetectorSetting')
  .post(authFacultyTaQuiz, headPoseDetectorSetting)

router.route('/mobileDetectorSetting')
  .post(authFacultyTaQuiz, mobileDetectorSetting)

router.route('/tabSwitchDetectorSetting')
  .post(authFacultyTaQuiz, tabSwitchDetectorSetting)

router.route('/ipAddressDetectorSetting')
  .post(authFacultyTaQuiz, ipAddressDetectorSetting)

router.route('/audioDetectorSetting')
  .post(authFacultyTaQuiz, audioDetectorSetting)

router.route('/deleteIllegalAttempts')
  .post(authFacultyTaQuiz, deleteIllegalAttempts)

router.route('/getQuestions')
  .post(authStudentQuiz, getQuestions)

router.route('/markAnswer')
  .post(authStudentQuiz, markAnswer);

router.route('/submit')
  .post(authStudentQuiz, submit);

router.route('/endTest')
  .post(authStudentQuiz, endTest);

router.route('/getQuizDetectionSettings')
  .post(authStudentQuiz, getQuizDetectionSettings);

router.route('/getTime')
  .post(authStudentQuiz, getTime);

router.route('/ipAddress')
  .post(authStudentQuiz, ipAddress);

router.route('/runCode')
  .post(authStudentQuiz, runCode);

router.route('/submitCode')
  .post(authStudentQuiz, submitCode);

router.route('/givingQuiz')
  .post(authStudentQuiz, givingQuiz);

router.route('/givingQuiz/:submissionId')
  .post(authStudentQuiz, exitingQuiz);

router.route('/audio')
  .post(authStudentQuiz, audio);

router.route('/windowBlurred')
  .post(authStudentQuiz, windowBlurred);

router.route('/screenSharingOff')
  .post(authStudentQuiz, screenSharingOff);

router.route('/tabChanged')
  .post(authStudentQuiz, tabChanged);

router.route('/mobileDetected')
  .post(authStudentQuiz, mobileDetected);

router.route('/multipleFace')
  .post(authStudentQuiz, multipleFace);

router.route('/changeInHeadPose')
  .post(authStudentQuiz, headPoseDetection);

router.route('/noPerson')
  .post(authStudentQuiz, noPerson);

router.route('/uploadPDF')
  .post([uploadPDFFile.single('pdfFile'), authStudentQuiz], uploadPDF)

router.route('/downloadSubmission/:studentsubmissionId')
  .get(authStudentQuiz, downloadSubmission)

module.exports = router;