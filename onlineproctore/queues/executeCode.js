const Queue = require("bull");
const executeCode = new Queue("Execute-Code");
const NUM_WORKERS = 10;
const LabCode = require('../models/labCodes');
const LabTestCase = require('../models/labTestCase');
const LabQuestion = require('../models/labQuestion');
const LabSubmission = require('../models/labSubmission');
const {c, cpp, node, python, java} = require('compile-run');

// code not executing on run command
executeCode.process(NUM_WORKERS, async (job, done) => {
  const data = job.data;
  const codeId = data.codeId;
  const flag = data.flag;
  var submittedCode = await LabCode.findOneLabCode({_id: codeId});
  var labQuestion = await LabQuestion.findOneLabQuestion({_id: submittedCode.labQuestion._id});
  var language;
  if(submittedCode.language == 'c')
    language = c;
  else if(submittedCode.language == 'cpp')
    language = cpp
  else if(submittedCode.language == 'java')
    language = java
  else if(submittedCode.language == 'python')
    language = python
  if(flag){
    var result = await language.runSource(submittedCode.code, {stdin: labQuestion.sampleInputTestCase.split('\r\n').join(' ')});
    var seperator = '\n';
    if(labQuestion.sampleOutputTestCase.includes('\r\n'))
      seperator = '\r\n';
    var expectedOutput = labQuestion.sampleOutputTestCase.split(seperator).join(' ');
    var output = result.stdout.split('\r\n').join(' ');
    if(expectedOutput[expectedOutput.length-1] == ' ')
      expectedOutput = expectedOutput.slice(0,expectedOutput.length-1);
    if(output[output.length-1] == ' ')
      output = output.slice(0,output.length-1);
    submittedCode.time = result.cpuUsage/1000000;
    submittedCode.memory = result.memoryUsage/(1024*1024);
    var success = true;
    if(expectedOutput !== output)
      success = false;
    var responseData = {
      stderr: result.stderr,
      success: success,
      stdout: result.stdout,
      exitCode: result.exitCode,
      errorType: result.errorType
    }
    submittedCode.save();
    done(null, responseData);
  }
  else{
    var labTestCases = await LabTestCase.find({labQuestion: submittedCode.labQuestion._id});
    var totalTestCases = labTestCases.length;
    var correctTestCases = 0;
    var totalTime = 0;
    var totalMemory = 0;
    for(var i=0; i<totalTestCases; i++){
      var result = await language.runSource(submittedCode.code, {stdin: labTestCases[i].testCaseInput.data.split('\r\n').join(' ')});
      var seperator = '\n';
      if(labTestCases[i].testCaseOutput.data.includes('\r\n'))
        seperator = '\r\n';
      var expectedOutput = labTestCases[i].testCaseOutput.data.split(seperator).join(' ');
      var output = result.stdout.split('\r\n').join(' ');
      if(expectedOutput[expectedOutput.length-1] == ' ')
        expectedOutput = expectedOutput.slice(0,expectedOutput.length-1);
      if(output[output.length-1] == ' ')
        output = output.slice(0,output.length-1);
      submittedCode.time += result.cpuUsage/1000000;
      submittedCode.memory += result.memoryUsage/(1024*1024);
      totalTime += result.cpuUsage/1000000;
      totalMemory += result.memoryUsage/(1024*1024);
      if(expectedOutput == output)
        correctTestCases += 1;
    }
    submittedCode.score = labQuestion.maximumMarks*(correctTestCases/totalTestCases);
    submittedCode.totalTestCases = totalTestCases;
    submittedCode.testCasesPassed = correctTestCases;
    submittedCode.save();
    var responseData = {
      totalTestCases: totalTestCases,
      correctTestCases: correctTestCases,
      totalTime: totalTime,
      totalMemory: totalMemory,
      marks: labQuestion.maximumMarks*(correctTestCases/totalTestCases),
      maximumMarks: labQuestion.maximumMarks,
      id: String(submittedCode._id)
    }
    var labSubmission = await LabSubmission.findOne({_id: submittedCode.labSubmission._id});
    var maxMarks = Math.max(parseFloat(labSubmission.questionMarks.get(String(labQuestion._id))), parseFloat(responseData.marks));
    labSubmission.questionMarks.set(String(labQuestion._id), maxMarks);
    labSubmission.save();
    done(null, responseData);
  }
});

executeCode.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  executeCode,
};