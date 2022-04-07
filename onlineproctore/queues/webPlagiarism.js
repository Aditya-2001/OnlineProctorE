const Queue = require("bull");
const webPlagiarism = new Queue("Find-Web-Plagiarism");
const QuestionSubmission = require('../models/questionSubmission');
const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');
const fs = require('fs').promises;
const path = require("path");
const NUM_WORKERS = 1;

webPlagiarism.process(NUM_WORKERS, async ({data}) => {
  const id = data.id;
  var studentSubmission = await QuestionSubmission.findOne({_id: id});
  const form = new FormData();
  var index = await fs.readFile(path.resolve(__dirname, "../keyIndex.txt"), 'utf8');
  var keys = await (await fs.readFile(path.resolve(__dirname, "../keys.txt"), 'utf8')).split('\r\n');
  form.append('key', keys[parseInt(index)]);
  form.append('data', studentSubmission.textfield);
  var response = await axios.post(config.webPlagURL, form, {headers: form.getHeaders()});
  if(response.data.isQueriesFinished != 'false'){
    await fs.writeFile(path.resolve(__dirname, "../keyIndex.txt"), index.replace(index, parseInt(index)+1), 'utf8');
    await webPlagiarism.add({id: id});
  }
  else{
    studentSubmission.webSource.plagiarismPercent = response.data.plagPercent;
    for(let i=0; i<response.data.sources.length; i++){
      studentSubmission.webSource.urls.push(response.data.sources[i].link);
    }
    studentSubmission.webDetectionDone = true;
    studentSubmission.save();
  }
});

webPlagiarism.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  webPlagiarism,
};