if(document.body.clientWidth<992){
  document.getElementById("passTemp").setAttribute("data-toggle","");
  document.getElementById("passTemp").setAttribute("data-target","");
  document.getElementById("passTemp").setAttribute("href","/update/passwordChange");
}

$("#form").submit(async function (e) {
  e.preventDefault();
  if(validate()==false) {
    return false;
  }
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError");
  try{
    const {data} = await axios.post('/update/passwordChange', serializedData);
    errorr.innerHTML = "";
    window.location = data.redirect;
  }catch(error){
    errorr.innerHTML = error.response.data.message;
    fader("#setError");
  }
})

$("#profile").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  try{
    const {data} = await axios.post('/update/profile', serializedData);
    window.location = data.redirect;
  }catch(error){

  }
})

function validate() {
  password1 = document.getElementById('password1').value
  password2 = document.getElementById('password2').value
  if(password1=="" || password2==""){
    document.getElementById("setError").innerHTML="Password must not be empty."
    fader('#setError')
    return false;
  }
  if (password1 != password2) {
    document.getElementById("setError").innerHTML = "Both the passwords are diferent";
    fader('#setError')
    return false;
  } else {
    var val = passwordchecker(password1)
    if (!val) {
      document.getElementById("setError").innerHTML = "Password must have atleast 8 characters with digits, letters and special characters";
      fader('#setError')
      return false
    }
    return true
  }
}

function passwordchecker(str) {
  if ((str.match(/[a-z]/g) || str.match(/[A-Z]/g)) && str.match(
      /[0-9]/g) && str.match(
      /[^a-zA-Z\d]/g) && str.length >= 8)
    return true;
  return false;
}

function fader(ID){
  $(ID).fadeIn()
  $(ID).delay(4000).fadeOut(4000)
}

function addImageLink(){
  var n = $('#questionImages').children().length;
  option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="imageLink'+(n+1)+'" placeholder="Enter Image Link '+(n+1)+'"></div>'
  $('#questionImages').append(option);
}

function addWrittenImageLink(){
  var n = $('#writtenQuestionImages').children().length;
  option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="imageLink'+(n+1)+'" placeholder="Enter Image Link '+(n+1)+'"></div>'
  $('#writtenQuestionImages').append(option);
}

function addOption(){
  var n = $('#questionOptions').children().length;
  option = '<div class="form-group"><input type="text" class="form-control" autocomplete="off" name="option'+(n+1)+'" placeholder="Enter Option '+(n+1)+'"></div>'
  $('#questionOptions').append(option);
}

$(document).ready(function () {
  $('.dtBasicExample').DataTable();
  $('.dtBasicExample1').DataTable();
  $('.dataTables_length').addClass('bs-select');
});

$("#changeCourseName").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  try{
    await axios.post(window.location.pathname+'/changeCourseName', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})

$("#makeCourseAnnouncement").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var course_id = document.getElementById("course_id").value;
  try{
    await axios.post(course_id+'/announce', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})

$("#addIndividualMember").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var course_id = document.getElementById("course_id").value;
  try{
    await axios.post(course_id+'/addSingleMember', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})


$("#addWrittenQuestion").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var quizId = document.getElementById("quizId").value;
  try{
    await axios.post(quizId+'/addWrittenQuestion', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})

$("#addMCQQuestion").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var quizId = document.getElementById("quizId").value;
  try{
    await axios.post(quizId+'/addMCQQuestion', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})

$("#createCourseQuiz").submit(async function (e) {
  e.preventDefault();
  if(!validateQuiz()){
    return false;
  }
  var serializedData = $(this).serialize();
  var course_id = document.getElementById("course_id").value;
  try{
    await axios.post(course_id+'/createQuiz', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})

async function generateScore(){
  var quizId = document.getElementById("quizId").value;
  try{
    await axios.get(quizId+'/generateScore');
    location.reload();
  }catch(error){
    console.log(error.response);
  }
}

async function generateSimilarityReport(){
  var quizId = document.getElementById("quizId").value;
  try{
    await axios.get(quizId+'/generateSimilarityReport');
    location.reload();
  }catch(error){
    console.log(error.response);
  }
}

async function generatePlagiarismReport(){
  var quizId = document.getElementById("quizId").value;
  try{
    await axios.get(quizId+'/generatePlagiarismReport');
    location.reload();
  }catch(error){
    console.log(error.response);
  }
}

function validateQuiz(){
  var startDate = new Date(document.getElementById("start_date").value);
  var endDate = new Date(document.getElementById("end_date").value);
  var setError = document.getElementById("setError");
  if(startDate <= Date.now()){
    setError.innerHTML = "Start Date of Quiz should be greater than Current Time";
    fader("#setError");
    return false;
  }
  else if(endDate <= Date.now()){
    setError.innerHTML = "End Date of Quiz should be greater than Current Time";
    fader("#setError");
    return false;
  }
  else if(startDate >= endDate){
    setError.innerHTML = "Start Date of Quiz should be less than End Date";
    fader("#setError");
    return false;
  }
  return true;
}

async function changeHierarchy(id, flag){
  data = {
    _id: id,
    flag: flag
  }
  var course_id = document.getElementById("course_id").value;
  try{
    await axios.post(course_id+'/changeHierarchy', data);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
}

function submitForm(id) {
  var frm = document.getElementById(id);
  frm.submit();
  frm.reset();
  return false;
}

function setID(id){
  document.getElementById("course_id").value=id;

}

function setIDName(id, cour_name){
  document.getElementById("course_id1").value=id;
  document.getElementById("cour_name").value=cour_name;
}

function fader(ID){
  $(ID).fadeIn()
  $(ID).delay(4000).fadeOut(4000)
}

faceDetector = document.getElementById('faceDetector');
faceDetector.addEventListener('change', e => {
  if(e.target.checked){
    $('#faceDetectorSpan').html('Turned On');
  } else {
    $('#faceDetectorSpan').html('Turned Off');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.post(quizId+'/faceDetectorSetting', {});
  }catch(error){
    console.log(error.response);
  }
});

mobileDetector = document.getElementById('mobileDetector');
mobileDetector.addEventListener('change', e => {
  if(e.target.checked){
    $('#mobileDetectorSpan').html('Turned On');
  } else {
    $('#mobileDetectorSpan').html('Turned Off');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.post(quizId+'/mobileDetectorSetting', {});
  }catch(error){
    console.log(error.response);
  }
});

tabSwitchDetector = document.getElementById('tabSwitchDetector');
tabSwitchDetector.addEventListener('change', e => {
  if(e.target.checked){
    $('#tabSwitchDetectorSpan').html('Turned On');
  } else {
    $('#tabSwitchDetectorSpan').html('Turned Off');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.post(quizId+'/tabSwitchDetectorSetting', {});
  }catch(error){
    console.log(error.response);
  }
});

ipAddressDetector = document.getElementById('ipAddressDetector');
ipAddressDetector.addEventListener('change', e => {
  if(e.target.checked){
    $('#ipAddressDetectorSpan').html('Turned On');
  } else {
    $('#ipAddressDetectorSpan').html('Turned Off');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.post(quizId+'/ipAddressDetectorSetting', {});
  }catch(error){
    console.log(error.response);
  }
});

audioDetector = document.getElementById('audioDetector');
audioDetector.addEventListener('change', e => {
  if(e.target.checked){
    $('#audioDetectorSpan').html('Turned On');
  } else {
    $('#audioDetectorSpan').html('Turned Off');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.post(quizId+'/audioDetectorSetting', {});
  }catch(error){
    console.log(error.response);
  }
});

visibility = document.getElementById('visibility');
visibility.addEventListener('change', e => {
  if(e.target.checked){
    $('#visibilitySpan').html('Visible');
  } else {
    $('#visibilitySpan').html('Hidden');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.get(quizId+'/hideQuiz');
  }catch(error){
    console.log(error.response);
  }
});

disablePrevious = document.getElementById('disablePrevious');
disablePrevious.addEventListener('change', e => {
  if(e.target.checked){
    $('#disablePreviousSpan').html('Allowed');
  } else {
    $('#disablePreviousSpan').html('Not Allowed');
  }
  var quizId = document.getElementById("quizId").value;
  try{
    axios.get(quizId+'/disablePrevious');
  }catch(error){
    console.log(error.response);
  }
});