$("#form").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError");
  try{
    const {data} = await axios.post('/users/forgotpassword', serializedData);
    errorr.style.color="green";
    errorr.innerHTML = "Check your inbox";
    fader("#setError");
  }catch(error){
    console.log(error.response.data);
    errorr.style.color="red";
    errorr.innerHTML = error.response.data.message;
    fader('#setError')
  }
})

function fader(ID){
  $(ID).fadeIn()
  $(ID).delay(4000).fadeOut(4000)
}