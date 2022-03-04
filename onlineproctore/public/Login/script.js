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

var isOpera = (navigator.userAgent.indexOf("OPR")==-1?false:true);

var isEdge = (navigator.userAgent.indexOf("Edg")==-1?false:true);

var isChrome = (navigator.userAgent.indexOf("Chrome")==-1?false:true);

var isChromium = (navigator.userAgent.indexOf("Chromium")==-1?false:true);

var isBrave = (navigator.userAgent.indexOf("Chrome")==-1?false:true);

if(!isOpera && !isEdge && !isChrome && !isChromium && !isBrave){
  window.location.href="/users/browserError";
}