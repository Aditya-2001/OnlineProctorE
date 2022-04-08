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

async function editMCQQuestion(id, question, maximumMarks, set, options, imageLinks, CorrectOptions, markingScheme, negativeMarking){
  document.getElementById('mcqQuestionId').value = id;
  question = question.slice(1, question.length-1);
  document.getElementById('mcqQuestion').value = question;
  document.getElementById('mcqMarks').value = maximumMarks;
  document.getElementById('mcqSet').value = set;
  var correctOptions = [];
  options = JSON.parse(options);
  CorrectOptions = JSON.parse(CorrectOptions);
  imageLinks = JSON.parse(imageLinks);
  var n = $('#editMCQQuestionOptions').children().length;
  for(let i=0; i<n; i++){
    $('#editMCQQuestionOptions').children().last().remove();
  }
  n = $('#editMCQQuestionImageLink').children().length;
  for(let i=0; i<n; i++){
    $('#editMCQQuestionImageLink').children().last().remove();
  }
  for(let i=0;i<options.length; i++){
    var option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="option'+(i+1)+'" id="mcqOption'+(i+1)+'" placeholder="Enter Option '+(i+1)+'"></div>'
    $('#editMCQQuestionOptions').append(option);
    document.getElementById('mcqOption'+(i+1)).value = options[i];
    if(CorrectOptions.includes(options[i])){
      correctOptions.push(i+1);
    }
  }
  if(imageLinks.length == 0){
    addImageLinkInEditMode();
  }
  for(let i=0;i<imageLinks.length; i++){
    var option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="imageLink'+(i+1)+'" onClick="parent.open(\''+imageLinks[i]+'\')" id="imageLink'+(i+1)+'" placeholder="Enter Image Link '+(i+1)+'"></div>';
    $('#editMCQQuestionImageLink').append(option);
    document.getElementById('imageLink'+(i+1)).value = imageLinks[i];
  }
  
  document.getElementById('mcqCorrectOptions').value = correctOptions;
  if(markingScheme){
    document.getElementById('yes').setAttribute('selected', 'true');
  }
  else{
    document.getElementById('no').setAttribute('selected', 'true');
  }
  document.getElementById('mcqNegativeMarking').value = negativeMarking;
}

function addOptionInEditMode(){
  var n = $('#editMCQQuestionOptions').children().length;
  option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="option'+(n+1)+'" placeholder="Enter Option '+(n+1)+'"></div>'
  $('#editMCQQuestionOptions').append(option);
}

function addImageLinkInEditMode(){
  n = $('#editMCQQuestionImageLink').children().length;
  option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="imageLink'+(n+1)+'" placeholder="Enter Image Link '+(n+1)+'"></div>'
  $('#editMCQQuestionImageLink').append(option);
}

function addImageLinkInWrittenEditMode(){
  n = $('#editWrittenQuestionImageLink').children().length;
  option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="imageLink'+(n+1)+'" placeholder="Enter Image Link '+(n+1)+'"></div>'
  $('#editWrittenQuestionImageLink').append(option);
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

async function editWrittenQuestion(id, question, maximumMarks, note, set, imageLinks, pdfUpload){
  document.getElementById('writtenQuestionId').value = id;
  question = question.slice(1, question.length-1);
  note = note.slice(1, note.length-1);
  document.getElementById('writtenQuestion').value = question;
  document.getElementById('writtenQuestionMarks').value = maximumMarks;
  document.getElementById('writtenQuestionNote').value = note;
  document.getElementById('writtenSet').value = set;
  n = $('#editWrittenQuestionImageLink').children().length;
  for(let i=0; i<n; i++){
    $('#editWrittenQuestionImageLink').children().last().remove();
  }
  imageLinks = JSON.parse(imageLinks);
  if(imageLinks.length == 0){
    addImageLinkInWrittenEditMode();
  }
  for(let i=0;i<imageLinks.length; i++){
    var option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="imageLink'+(i+1)+'" onClick="parent.open(\''+imageLinks[i]+'\')" id="imageLinkWritten'+(i+1)+'" placeholder="Enter Image Link '+(i+1)+'"></div>';
    $('#editWrittenQuestionImageLink').append(option);
    document.getElementById('imageLinkWritten'+(i+1)).value = imageLinks[i];
  }
  if(pdfUpload == 'true'){
    $('#editWrittenQuestionPdfUploadInput').attr('checked', true);
    $("#editWrittenQuestionPdfUploadSpan").html('Handwritten');
  }
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

$("#editCourseQuiz").submit(async function (e) {
  e.preventDefault();
  const quizId = document.getElementById('quizId').value;
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError1");
  var endDate = new Date(document.getElementById("end_date").value);
  try{
    await axios.post(quizId + '/editCourseQuiz', serializedData);
    errorr.style.color="green";
    errorr.innerHTML = "Timing Changed";
    fader("#setError1");
    if(endDate <= Date.now()){
      location.reload();
    }
  }catch(error){
    console.log(error);
    // errorr.style.color="red";
    // errorr.innerHTML = error.response.data.message;
    // fader('#setError')
  }
})

$("#pdfUploadDurationForm").submit(async function (e) {
  e.preventDefault();
  const quizId = document.getElementById('quizId').value;
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError1");
  try{
    await axios.post(quizId + '/pdfUploadDuration', serializedData);
    errorr.style.color="green";
    errorr.innerHTML = "PDF Upload Time Updated";
    fader("#setError1");
  }catch(error){
    console.log(error);
  }
})