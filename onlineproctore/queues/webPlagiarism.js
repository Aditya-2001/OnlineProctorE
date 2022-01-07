const Queue = require("bull");
const webPlagiarism = new Queue("Find-Web-Plagiarism");
const QuestionSubmission = require('../models/questionSubmission');
const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');
const NUM_WORKERS = 10;

webPlagiarism.process(NUM_WORKERS, async ({data}) => {
  const id = data.id;
  await QuestionSubmission.findOne({_id: id}, async (err, studentSubmission) => {
    const form = new FormData();
    form.append('key', config.webPlagAPI);
    form.append('data', studentSubmission.textfield);
    axios.post(config.webPlagURL, form, {headers: form.getHeaders()})
    .then(function (response) {
      studentSubmission.webSource.plagiarismPercent = response.data.plagPercent;
      for(let i=0; i<response.data.sources.length; i++){
        studentSubmission.webSource.urls.push(response.data.sources[i].link);
      }
      studentSubmission.save();
    })
    .catch(function (error) {
      console.log(error);
    });
  }).clone().catch(function(err){console.log(err)})
});

webPlagiarism.on("failed", (error) => {
  console.log(error);
});

module.exports = {
  webPlagiarism,
};