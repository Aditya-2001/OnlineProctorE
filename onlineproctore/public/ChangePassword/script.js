$("#form").submit(async function (e) {
  e.preventDefault();
  if(validate()==false) {
    console.log('frjr');
    return false;
  }
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError");
  try{
    const {data} = await axios.post('', serializedData);
    errorr.innerHTML = "";
    window.location = data.redirect;
  }catch(error){
    errorr.innerHTML = error.response.data.message;
    fader("#setError");
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