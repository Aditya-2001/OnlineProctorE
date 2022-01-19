if(document.cookie.includes('isAuth=true')){
  window.location = '/dashboard';
}
$("#form").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError");
  try{
    const {data} = await axios.post('/users/login', serializedData);
    errorr.innerHTML = "";
    window.location = data.redirect;
  }catch(error){
    errorr.innerHTML = error.response.data.message;
    fader('#setError');
  }
})

function fader(ID){
  $(ID).fadeIn()
  $(ID).delay(4000).fadeOut(4000)
}