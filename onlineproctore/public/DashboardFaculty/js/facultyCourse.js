$("#courseCreationForm").submit(async function (e) {
  e.preventDefault();
  var serializedData = $(this).serialize();
  try{
    await axios.post(window.location.pathname+'/add', serializedData);
    location.reload();
  }catch(error){
    console.log(error.response);
  }
})