$("#form").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  var errorr = document.getElementById("setError");
  try{
    const {data} = await axios.post('/users/forgotpassword', serializedData);
    errorr.innerHTML = "";
  }catch(error){
    console.log(error.response.data);
    errorr.innerHTML = error.response.data.message;
    setTimeout(function(){ errorr.innerHTML = "" }, 2000);
  }
})