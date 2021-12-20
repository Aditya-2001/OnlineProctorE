if(document.body.clientWidth<992){
    document.getElementById("profTemp").setAttribute("data-toggle","");
    document.getElementById("profTemp").setAttribute("data-target","");
    document.getElementById("passTemp").setAttribute("data-toggle","");
    document.getElementById("passTemp").setAttribute("data-target","");
    document.getElementById("profTemp").setAttribute("href","Profile.html");
    document.getElementById("passTemp").setAttribute("href","Password.html");
}

$("#courseCreationForm").submit(async function (e) {
    e.preventDefault();
    var serializedData = $(this).serialize();
    try{
      await axios.post('/dashboard/faculty/add', serializedData);
      location.reload();
    }catch(error){
      console.log(error.response);
    }
})

$("#changeCourseName").submit(async function (e) {
    e.preventDefault();
    var serializedData = $(this).serialize();
    try{
      await axios.post('/dashboard/faculty/changeCourseName', serializedData);
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

$("#createCourseQuiz").submit(async function (e) {
  e.preventDefault();
  if(!validateQuiz()){
    return false;
  }
  var serializedData = $(this).serialize();
  var course_id = document.getElementById("course_id").value;
  try{
    await axios.post(course_id+'/createquiz', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})

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