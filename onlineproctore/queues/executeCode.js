const Queue = require("bull");
const executeCode = new Queue("Execute-Code");
const NUM_WORKERS = 10;
const LabCode = require('../models/labCodes');
const LabQuestion = require('../models/labQuestion');
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
    var expectedOutput = labQuestion.sampleOutputTestCase.split('\r\n').join(' ');
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
    done(null, responseData);
  }
});

executeCode.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  executeCode,
};