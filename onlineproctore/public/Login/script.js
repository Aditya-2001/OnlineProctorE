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
    setTimeout(function(){ errorr.innerHTML = "" }, 2000);
  }
})