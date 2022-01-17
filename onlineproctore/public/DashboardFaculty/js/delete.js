async function deleteEnrollment(id){
  const course_id = document.getElementById('course_id').value;
  try{
    await axios.post(course_id + '/deleteEnrollment', {id: id});
    location.reload();
  }catch(e){
    console.log(e);
  }
}

async function deleteInstructor(id){
  const course_id = document.getElementById('course_id').value;
  try{
    await axios.post(course_id + '/deleteInstructor', {id: id});
    location.reload();
  }catch(e){
    console.log(e);
  }
}

async function deleteQuestion(id){
  const quizId = document.getElementById('quizId').value;
  try{
    await axios.post(quizId + '/deleteQuestion', {id: id});
    location.reload();
  }catch(e){
    console.log(e);
  }
}

async function editMCQQuestion(id, question){
  question = JSON.parse(question);
  document.getElementById('mcqQuestionId').value = id;
  document.getElementById('mcqQuestion').value = question.question;
  document.getElementById('mcqMarks').value = question.maximumMarks;
  var correctOptions = [];
  for(let i=0;i<6;i++){
    document.getElementById('mcqOption'+(i+1)).value = '';
  }
  for(let i=0;i<question.options.length; i++){
    document.getElementById('mcqOption'+(i+1)).value = question.options[i];
    if(question.correctOptions.includes(question.options[i])){
      correctOptions.push(i+1);
    }
  }
  document.getElementById('mcqCorrectOptions').value = correctOptions;
  if(question.markingScheme){
    document.getElementById('yes').setAttribute('selected', 'true');
  }
  else{
    document.getElementById('no').setAttribute('selected', 'true');
  }
  document.getElementById('mcqNegativeMarking').value = question.negativeMarking;
}

$("#editMCQQuestion").submit(async function (e) {
  e.preventDefault();
  const quizId = document.getElementById('quizId').value;
  var serializedData = $(this).serialize();
  try{
    await axios.post(quizId + '/editMCQQuestion', serializedData);
    location.reload();
  }catch(error){
    console.log(error);
  }
})

async function editWrittenQuestion(id, question){
  question = JSON.parse(question);
  document.getElementById('writtenQuestionId').value = id;
  document.getElementById('writtenQuestion').value = question.question;
  document.getElementById('writtenQuestionMarks').value = question.maximumMarks;
  document.getElementById('writtenQuestionNote').value = question.note;
}

$("#editWrittenQuestion").submit(async function (e) {
  e.preventDefault();
  const quizId = document.getElementById('quizId').value;
  var serializedData = $(this).serialize();
  try{
    await axios.post(quizId + '/editWrittenQuestion', serializedData);
    location.reload();
  }catch(error){
    console.log(error);
  }
})

async function setDate(startDate, endDate){
  startDate = new Date(startDate);
  sdate = startDate.getFullYear()+"-"+("0" + startDate.getMonth()+1).slice(-2)+"-"+startDate.getDate()+"T"+startDate.toString().slice(16,21);
  document.getElementById("start_date").value = sdate;
  endDate = new Date(endDate);
  edate = endDate.getFullYear()+"-"+("0" + endDate.getMonth()+1).slice(-2)+"-"+endDate.getDate()+"T"+endDate.toString().slice(16,21);
  document.getElementById("end_date").value = edate;
}

$("#editCourseQuiz").submit(async function (e) {
  e.preventDefault();
  const quizId = document.getElementById('quizId').value;
  var serializedData = $(this).serialize();
  try{
    await axios.post(quizId + '/editCourseQuiz', serializedData);
    location.reload();
  }catch(error){
    console.log(error);
  }
})