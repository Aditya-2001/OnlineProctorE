var countDownDate = new Date("Jan 01 2022 20:47:00").getTime();

var questionsType = new Map([
    ['page01', true],
    ['page02', true],
    ['page03', true],
    ['page04', false]
]);

var optionsCount = new Map([
    ['page01', 5],
    ['page02', 5],
    ['page03', 5],
    ['page04', 2]
])

window.onload = function() {
    start();
    getQuizQuestions();
};
async function start(){
    let video = document.querySelector("#video");
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
}

async function getQuizQuestions(){
    var quizId = document.getElementById("quizId").value;
    console.log('function called');
    try{
        const response = await axios.get(quizId+'/getQuestions');
        console.log(response);
    }catch(error){
        console.log(error.response);
    }

}
function nextOrPrevQuestion() {
    // console.log($('.quiz-card').find('.ques-ans.active')[0].id);
    var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
    if(questionsType.get(questionId)){
        var count = 0;
        var markedAnswer = [];
        for(var i=1; i<optionsCount.get(questionId); i++){
            var optionId = "#option"+i+questionId;
            var textId = "#text"+i+questionId;
            if($(optionId).is(':checked')){
                count++;
                markedAnswer.push($(textId)[0].innerHTML);
            }
        }
        document.getElementById('display'+questionId).classList=['test-ques'];
        if(count == 0){
            document.getElementById('display'+questionId).classList.add('que-not-answered');
        }
        else{
            document.getElementById('display'+questionId).classList.add('que-save');
        }
        // console.log($('.quiz-card').find('.ques-ans.active').find('.answer')[0].childNodes[1].childNodes[1].checked)
    }
    else{
        var answer = $.trim($("#text1"+questionId).val());
        document.getElementById('display'+questionId).classList=['test-ques'];
        if(answer == ''){
            document.getElementById('display'+questionId).classList.add('que-not-answered');
        }
        else{
            document.getElementById('display'+questionId).classList.add('que-save');
        }
    }
}
function markQuestion() {
    // console.log($('.quiz-card').find('.ques-ans.active')[0].id);
    var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
    if(questionsType.get(questionId)){
        var count = 0;
        var markedAnswer = [];
        for(var i=1; i<optionsCount.get(questionId); i++){
            var optionId = "#option"+i+questionId;
            var textId = "#text"+i+questionId;
            if($(optionId).is(':checked')){
                count++;
                markedAnswer.push($(textId)[0].innerHTML);
            }
        }
        document.getElementById('display'+questionId).classList='test-ques que-mark';
        // console.log($('.quiz-card').find('.ques-ans.active').find('.answer')[0].childNodes[1].childNodes[1].checked)
    }
    else{
        document.getElementById('display'+questionId).classList='test-ques que-mark';
    }
}
$(document).ready(function(){
    $('.next').click(function(){
        nextOrPrevQuestion();
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
    })
    $('.mark').click(function(){
        markQuestion();
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
    })
    $('.prev').click(function(){
        nextOrPrevQuestion();
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