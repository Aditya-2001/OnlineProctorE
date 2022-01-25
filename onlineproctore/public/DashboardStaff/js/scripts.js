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

function submitForm() {
  var frm = document.getElementById("formadduserstaff");
  frm.submit();
  frm.reset();
  return false;
}

async function deleteUser(id){
  try{
    await axios.post('/dashboard/staff/users/deleteUser', {id: id});
    location.reload();
  }catch(e){
    console.log(e);
  }
}