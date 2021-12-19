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

function submitForm() {
    var frm = document.getElementById("changeCourseImage");
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