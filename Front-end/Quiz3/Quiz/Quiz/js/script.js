var countDownDate = new Date("Jan 01, 2023 20:47:00").getTime();
var wid;
var leftTime=10;
var temp=setInterval(function(){
    leftTime-=1;
    if(leftTime==0){
        clearInterval(temp);
        document.getElementById("quiz-start-time").innerHTML="";
        document.getElementById("start-the-test").removeAttribute("disabled");
    }
    else{
        document.getElementById("quiz-start-time").innerHTML=leftTime+" sec";
    }
},1000);
function startTest(){
    console.log("Good");
}

// window.onload = function() {
//     // start();
//     // wid=setInterval(()=>{
//     //     $('#navigationBar').height($('#addQuestions').height());
//     //     console.log("Bada");
//     // }, 1000)
// };
// setInterval(()=>{
//     if(window.innerWidth<991){
//         console.log(wid);
//         clearInterval(wid);
//         console.log(wid);
//         // console.log(window.innerWidth);
//         $('#navigationBar').css("height","fit-content");
//         // document.getElementById("navigationBar").style.height="fit-content !important";
//         // document.getElementById("navigationBar").removeAttribute('style');
//         console.log("Chota");
//     }
//     else{
//         wid=setInterval(()=>{
//             $('#navigationBar').css("height",$('#addQuestions').height());
//         }, 1000)
//         console.log("Bada2");
//     }
// }, 200)
// Run myfunc every second
var myfunc = setInterval(function() {
    var now = new Date().getTime();
    var timeleft = countDownDate - now;
    console.log(timeleft);
        
    // Calculating the days, hours, minutes and seconds left
    var hoursrem = Math.floor((timeleft) / (1000 * 60 * 60));
    var hours=hoursrem
    if(hoursrem<10){
        hours="0"+hoursrem
    }
    var minutesrem = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    var minutes = minutesrem
    if(minutesrem<10){
        minutes="0"+minutesrem
    }
    var secondsrem = Math.floor((timeleft % (1000 * 60)) / 1000);
    var seconds=secondsrem
    if(secondsrem<10){
        seconds="0"+secondsrem;
    }
        
    // Result is output to the specific element
    document.getElementById("hours").innerHTML = hours + ":" 
    document.getElementById("mins").innerHTML = minutes + ":" 
    document.getElementById("secs").innerHTML = seconds 
        
    // Display the message when countdown is over
    if (timeleft < 0) {
        clearInterval(myfunc);
        document.getElementById("hours").innerHTML = "" 
        document.getElementById("mins").innerHTML = ""
        document.getElementById("secs").innerHTML = ""
        document.getElementById("end").innerHTML = "TIME UP!!";
    }
}, 1000);
async function start(){
    let video = document.querySelector("#video");
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
}