var countDownDate = new Date("Jan 01 2022 20:47:00").getTime();
window.onload = function() {
    start();
};
async function start(){
    let video = document.querySelector("#video");
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
}

$(document).ready(function(){
    $('.next').click(function(){
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
    })
    $('.mark').click(function(){
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
    })
    $('.prev').click(function(){
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('active');
        $('.quiz-card').find('.ques-ans.active').next().addClass('none');
        $('.quiz-card').find('.ques-ans.active').next().removeClass('active');
    })
})
async function display(id){
    $('.quiz-card').find('.ques-ans.active').addClass('none');
    $('.quiz-card').find('.ques-ans.active').removeClass('active');
    document.getElementById(id).classList.add('active');
    document.getElementById(id).classList.remove('none');
}
// Run myfunc every second
var myfunc = setInterval(function() {
    var now = new Date().getTime();
    var timeleft = countDownDate - now;
    // console.log(timeleft);
        
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