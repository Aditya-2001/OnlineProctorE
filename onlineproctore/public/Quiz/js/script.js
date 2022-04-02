var questionsType = new Map();
var questionMarking = new Map();
var questionSubmissionLocked = new Map();
var optionsCount = new Map();
var pdfUpload = false;
var pdfUploadDuration = 10;
var lastQuestionId;
const peers = {};
const peersScreen = {};
var socket;
let setHeight;
var myPeer, myPeerScreen;
var leftTime = 1;
var testStarted = false;
var currentElement = null;
azchar = "abcdefghijklmnopqrstuvwxyz"
char01 = "0123456789"
var mappings = {};
document.addEventListener('mouseover', function (e) {
    currentElement = e.target;
    // console.log(currentElement.nodeName);
});
function startTest(){
    testStarted = true;
    document.getElementById('quizInstructionsDiv').classList.add('none');
    document.getElementById('quizQuestionsDiv').classList.remove('none');
    var submissionId=document.getElementById("submissionId").value;
    var quizId = document.getElementById("quizId").value;
    axios.post(quizId + '/givingQuiz', {submissionId: submissionId});
}

var subId = document.getElementById("submissionId").value;
var qId = document.getElementById("quizId").value;
var d={submissionId: subId};
var url = qId + '/givingQuiz/' + subId;
window.addEventListener("unload", function (e) { 
    navigator.sendBeacon(url, d);
});

var quizId = document.getElementById("quizId").value;
var time = axios.post(quizId + '/getTime', {});
time.then( t => {
    var now = t.data.time;
    countDownDate = t.data.countDownDate;
    if(t.data.redirect){
        nextOrPrevQuestion();
        window.location.href = t.data.url;
    }
    var myfunc = setInterval(function() {
        var timeleft = countDownDate - now;
        now += 999;
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
        
        if(timeleft < pdfUploadDuration*60*1000 && pdfUpload){
            if(!document.getElementById('quizInstructionsDiv').classList.contains('none')){
                document.getElementById('quizInstructionsDiv').classList.add('none');
            }
            displayUploadPDFDiv();
            $('#cancelUpload').attr('disabled', true);
        }

        // Display the message when countdown is over
        if (timeleft < 0) {
            clearInterval(myfunc);
            document.getElementById("hours").innerHTML = "" 
            document.getElementById("mins").innerHTML = ""
            document.getElementById("secs").innerHTML = ""
            document.getElementById("end").innerHTML = "TIME UP!!";
            nextOrPrevQuestion();
            $('.disable').attr('disabled', true);
            var submissionId = document.getElementById("submissionId").value;
            var data = {
                submissionId: submissionId
            };
            try{
                var response = axios.post(quizId + '/endTest', data);
                response.then( result => {
                    window.location.href = result.data.url;
                })
            }
            catch(error){
                console.log(error);
            }
        }
    }, 1000);
})

var leftTimeInterval=setInterval(function(){
    if(leftTime==0){
        clearInterval(leftTimeInterval);
        document.getElementById("quiz-start-time").innerHTML="";
        document.getElementById("start-the-test").removeAttribute("disabled");
    }
    else{
        leftTime-=1;
        document.getElementById("quiz-start-time").innerText=(leftTime+" sec");
    }
},1000);

var detections;
var quizDetectionResponse = axios.post(document.getElementById("quizId").value + '/getQuizDetectionSettings', {});
quizDetectionResponse.then( result => {
    detections = result.data;
    sendIP();
    AudioVideoDetection();
    startSharing();
    if(detections.faceDetector && detections.mobileDetector){
        cocoSsd.load().then(function (loadedModel) {
            model = loadedModel;
            enableCam();
        });
    }
    if(detections.headPoseDetector){
        headposeEstimationInitialise();
        headposeEstimation();
    }
})
getQuizQuestions();
socket = io("/");
myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: 'onlineproctore.herokuapp.com',
    port: '443'
})
myPeerScreen = new Peer(undefined, {
    path: '/peerjs',
    host: 'onlineproctore.herokuapp.com',
    port: '443'
})
myPeer.on('open', id => {
    socket.emit('join-room1', ROOM_ID + '1', id);
})
myPeerScreen.on('open', id => {
    socket.emit('join-room2', ROOM_ID + '2', id);
})
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    if (peersScreen[userId]) peersScreen[userId].close()
})

async function getQuizQuestions(){
    var quizId = document.getElementById("quizId").value;
    try{
        const response = await axios.post(quizId+'/getQuestions',{});
        if(response.data.redirect){
            window.location.href = response.data.url;
            return;
        }
        const quiz = response.data.quiz;
        pdfUpload = quiz.pdfUpload;
        const questions = response.data.questions;
        const questionSubmissions = response.data.questionSubmissions;
        if(Date.now() >= quiz.endDate || questionSubmissions[0].submission.submitted){
            console.log(questionSubmissions[0].submission.submitted);
            window.location.href = '/dashboard/user/course/'+quiz.course._id;
        }
        var submissionId=document.getElementById("submissionId").value;
        if(quiz.disablePrevious){
            $('#previous').attr("disabled", true);
            document.getElementById('previous').classList.add('none');
            $('#markForReview').attr("disabled", true);
            document.getElementById('markForReview').classList.add('none');
        }
        var questionCount = questions.length;
        var shuffleOrder = [];
        for (var i=0; i<questionCount; i++){
            shuffleOrder.push(i);
        }
        shuffleOrder=shuffledArray(shuffleOrder, submissionId);
        console.log(shuffleOrder)
        for (var i=0; i<questionCount; i++){
            var j = shuffleOrder[i];
            var displayQuestion = '<div class="ques-ans';
            if(i==0){
                displayQuestion += ' active"';
            }
            else{
                displayQuestion += ' none"';
            }
            displayQuestion += 'id="' + questions[j]._id + '"><div class="question"><span class="que">Q</span><span class="question-number">';
            displayQuestion += (i+1) + '.</span>' + questions[j].question + '<br><br>';
            displayQuestion += '<div style="text-align: center;">'
            for(var ic=0; ic<questions[j].imageLinks.length; ic++){
                if(ic==0){
                    displayQuestion += '<img class="questionImage1" id="image' + ic + questions[j]._id +'" src="https://drive.google.com/uc?export=view&id='+questions[j].imageLinks[ic].split('/').reverse()[1]+'"><br>';
                    continue;
                }
                else{
                    displayQuestion += '<img class="questionImage2" id="image' + ic + questions[j]._id +'" src="https://drive.google.com/uc?export=view&id='+questions[j].imageLinks[ic].split('/').reverse()[1]+'">';
                }
            }
            displayQuestion += '</div></div> <hr><div class="answer';
            questionsType.set(questions[j]._id, questions[j].mcq);
            questionMarking.set(questions[j]._id, {'mm': questions[j].maximumMarks, 'nm': questions[j].negativeMarking, 'pm': questions[j].markingScheme})
            var submission = questionSubmissions.find( ({question}) => question._id === questions[j]._id);
            var flag = false;
            if(questions[j].mcq){
                optionsCount.set(questions[j]._id, questions[j].options.length+1);
                displayQuestion += ' checkbox">';
                var optionsOrder = [];
                for(var k=0; k<optionsCount.get(questions[j]._id)-1; k++){
                    optionsOrder.push(k);
                }
                for(var k=0; k<optionsCount.get(questions[j]._id)-1; k++){
                    var o = optionsOrder[Math.floor(Math.random() * (optionsCount.get(questions[j]._id)-k-1))];
                    optionsOrder.splice(optionsOrder.indexOf(o), 1);
                    displayQuestion += '<label><input class="disable" type="checkbox" name="option' + (k+1) + '" value="option' + (k+1) + '" id="option' + (k+1) + questions[j]._id + '"';
                    if(submission.optionsMarked.includes(questions[j].options[o])){
                        displayQuestion += ' checked';
                        flag = true;
                    }
                    displayQuestion += '><i class="fa icon-checkbox"></i><span class="options" id="text' + (k+1) + questions[j]._id + '">' + questions[j].options[o] + '</span></label><br>';
                }
                displayQuestion += '</div><div class="blank-space"></div></div>';
            }
            else{
                optionsCount.set(questions[j]._id, 1);
                displayQuestion += '"><textarea class="disable" id="text1' + questions[j]._id + '" name="subjective" onkeydown=';
                displayQuestion += '"if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+\'\t\'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}"></textarea></div><div class="blank-space"></div></div>';
            }
            $('#addQuestions').append(displayQuestion);
            if(i==0){
                setMarks();
            }
            if(!questions[j].mcq){
                if(quiz.pdfUpload){
                    document.getElementById("text1"+questions[j]._id).value = 'Kindly write the anwser on a A4 size sheet';
                    $("#text1"+questions[j]._id).attr("disabled", true);
                }
                else{
                    document.getElementById("text1"+questions[j]._id).value = submission.textfield;
                }
                var answer = $.trim($("#text1"+questions[j]._id).val());
                if(answer == '' || answer == 'Kindly write the anwser on a A4 size sheet'){}
                else{
                    flag=true;
                }
            }
            var navigation = '<li><button id="display' + questions[j]._id + '" class="test-ques disable ';
            if(submission.markedForReview){
                navigation += 'que-mark';
            }
            else if(flag){
                navigation += 'que-save';
            }
            else if(submission.notAnswered){
                navigation += 'que-not-answered';
            }
            else{
                navigation += 'que-not-attempted';
            }
            navigation += '" onclick="display(\'' + questions[j]._id + '\')"';
            if(quiz.disablePrevious){
                navigation += ' disabled>';
            }
            else{
                navigation += '>';
            }
            navigation += i+1 + '</button></li>'
            questionSubmissionLocked.set(questions[j]._id, submission.answerLocked);
            if(submission.answerLocked && quiz.disablePrevious){
                if(questions[j].mcq){
                    for(var k=0; k<optionsCount.get(questions[j]._id)-1; k++){
                        $("#option"+ (k+1) + questions[j]._id).attr("disabled", true);
                    }
                }
                else{
                    $("#text1"+questions[j]._id).attr("disabled", true);
                }
            }
            // console.log(navigation);
            $('#navigator').append(navigation);
            if(i == questionCount-1){
                lastQuestionId = questions[j]._id;
            }
        }
    }
    catch(error){
        console.log("Error :", error);
    }

}

function nextOrPrevQuestion() {
    // console.log($('.quiz-card').find('.ques-ans.active')[0].id);
    var submissionId = document.getElementById("submissionId").value;
    var quizId = document.getElementById("quizId").value;
    var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
    var markedAnswer;
    var notAnswered = false;
    if(!questionSubmissionLocked.get(questionId) || (!pdfUpload && !questionsType.get(questionId))){
        if(questionsType.get(questionId)){
            var count = 0;
            markedAnswer = [];
            for(var i=0; i<optionsCount.get(questionId)-1; i++){
                var optionId = "#option"+(i+1)+questionId;
                var textId = "#text"+(i+1)+questionId;
                if($(optionId).is(':checked')){
                    count++;
                    markedAnswer.push($(textId)[0].innerHTML);
                }
            }
            document.getElementById('display'+questionId).classList='test-ques disable';
            if(count == 0){
                document.getElementById('display'+questionId).classList.add('que-not-answered');
                notAnswered = true;
            }
            else{
                document.getElementById('display'+questionId).classList.add('que-save');
            }
            // console.log($('.quiz-card').find('.ques-ans.active').find('.answer')[0].childNodes[1].childNodes[1].checked)
        }
        else{
            markedAnswer = $.trim($("#text1"+questionId).val());
            // console.log(document.getElementById('text1'+questionId).value);
            document.getElementById('display'+questionId).classList='test-ques disable';
            if(markedAnswer !== 'Kindly write the anwser on a A4 size sheet'){
                if(markedAnswer == ''){
                    document.getElementById('display'+questionId).classList.add('que-not-answered');
                    notAnswered = true;
                }
                else{
                    document.getElementById('display'+questionId).classList.add('que-save');
                }
            }
            else{
                document.getElementById('display'+questionId).classList.add('que-not-attempted');
            }
        }
        var answerLocked = false;
        if($('#previous').attr("disabled")){
            answerLocked = true;
        }
        var data = {
            questionId: questionId,
            submissionId: submissionId,
            mcq: questionsType.get(questionId),
            markedAnswer: markedAnswer,
            answerLocked: answerLocked,
            notAnswered: notAnswered,
            markedForReview: false
        }
        try{
            axios.post(quizId + '/markAnswer', data);
        }
        catch(error){
            console.log("Error :", error);
        }
    }
}

function markQuestion() {
    // console.log($('.quiz-card').find('.ques-ans.active')[0].id);
    var submissionId = document.getElementById("submissionId").value;
    var quizId = document.getElementById("quizId").value;
    var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
    var markedAnswer;
    var notAnswered = false;
    if(!questionSubmissionLocked.get(questionId) || (!pdfUpload && !questionsType.get(questionId))){
        if(questionsType.get(questionId)){
            var count = 0;
            markedAnswer = [];
            for(var i=1; i<optionsCount.get(questionId); i++){
                var optionId = "#option"+i+questionId;
                var textId = "#text"+i+questionId;
                if($(optionId).is(':checked')){
                    count++;
                    markedAnswer.push($(textId)[0].innerHTML);
                }
            }
            document.getElementById('display'+questionId).classList='test-ques disable que-mark';
            // console.log($('.quiz-card').find('.ques-ans.active').find('.answer')[0].childNodes[1].childNodes[1].checked)
        }
        else{
            markedAnswer = $.trim($("#text1"+questionId).val());
            document.getElementById('display'+questionId).classList='test-ques disable que-mark';
        }
        var answerLocked = false;
        if($('#previous').attr("disabled")){
            answerLocked = true;
        }
        var data = {
            questionId: questionId,
            submissionId: submissionId,
            mcq: questionsType.get(questionId),
            markedAnswer: markedAnswer,
            answerLocked: answerLocked,
            notAnswered: notAnswered,
            markedForReview: true
        }
        try{
            axios.post(quizId + '/markAnswer', data);
        }
        catch(error){
            console.log("Error :", error);
        }
    }
}

function setMarks(){
    var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
    document.getElementById('mm').innerHTML = questionMarking.get(questionId).mm;
    if(questionMarking.get(questionId).nm){
        document.getElementById('nm').innerHTML = -questionMarking.get(questionId).nm;
    }
    else{
        document.getElementById('nm').innerHTML = questionMarking.get(questionId).nm;
    }
    if(questionMarking.get(questionId).pm){
        document.getElementById('pm').innerHTML = "Yes";
    }
    else{
        document.getElementById('pm').innerHTML = "No";
    }
}

function displayUploadPDFDiv(){
    document.getElementById('quizQuestionsDiv').classList.add('none');
    document.getElementById('quizUploadPDFDiv').classList.remove('none');
}

function cancelUploadPDF(){
    document.getElementById('quizUploadPDFDiv').classList.add('none');
    document.getElementById('quizQuestionsDiv').classList.remove('none');
    document.getElementById('uploadPDF').classList.add('none');
    document.getElementById('saveAndNext').classList.remove('none');
}

$(document).ready(function(){
    $('.next').click(function(){
        nextOrPrevQuestion();
        var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
        if(pdfUpload && questionId == lastQuestionId){
            document.getElementById('saveAndNext').classList.add('none');
            document.getElementById('uploadPDF').classList.remove('none');
        }
        else{
            document.getElementById('uploadPDF').classList.add('none');
            document.getElementById('saveAndNext').classList.remove('none');
        }
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
        setMarks();
    })
    $('.mark').click(function(){
        markQuestion();
        var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
        if(pdfUpload && questionId == lastQuestionId){
            document.getElementById('saveAndNext').classList.add('none');
            document.getElementById('uploadPDF').classList.remove('none');
        }
        else{
            document.getElementById('uploadPDF').classList.add('none');
            document.getElementById('saveAndNext').classList.remove('none');
        }
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
        setMarks();
    })
    $('.prev').click(function(){
        nextOrPrevQuestion();
        var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
        if(pdfUpload && questionId == lastQuestionId){
            document.getElementById('uploadPDF').classList.add('none');
            document.getElementById('saveAndNext').classList.remove('none');
        }
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('active');
        $('.quiz-card').find('.ques-ans.active').next().addClass('none');
        $('.quiz-card').find('.ques-ans.active').next().removeClass('active');
        setMarks();
    })
    $('.submit').click(function(){
        submitPaper();
    })
})

function submitPaper(){
    nextOrPrevQuestion();
    var result = confirm("Are you sure you want to submit?");
    if (result) {
        var submissionId = document.getElementById("submissionId").value;
        var quizId = document.getElementById("quizId").value;
        var data = {
            submissionId: submissionId
        };
        if(testStarted){
            try{
                var response = axios.post(quizId + '/submit', data);
                response.then( result => {
                    window.location.href = result.data.url;
                })
            }
            catch(error){
                console.log("Error :", error);
            }
        }
    }
}

async function display(id){
    nextOrPrevQuestion();
    $('.quiz-card').find('.ques-ans.active').addClass('none');
    $('.quiz-card').find('.ques-ans.active').removeClass('active');
    document.getElementById(id).classList.add('active');
    document.getElementById(id).classList.remove('none');
    setMarks()
}

setInterval(()=>{
    fetch('https://www.google.com', {
        method: 'GET',
        mode: 'no-cors',
    }).then((result) => {

    }).catch(e => {
        location.reload();
    })
}, 1000);

function sendIP(){
    $.getJSON('https://api.db-ip.com/v2/free/self', function(data) {
        ip=data["ipAddress"];
        var submissionId = document.getElementById("submissionId").value;
        var quizId = document.getElementById("quizId").value;
        var data = {
            submissionId: submissionId,
            ip: ip
        };
        if(detections.ipAddressDetector){
            try{
                axios.post(quizId + '/ipAddress', data);
            }
            catch(error){
                console.log("Error :", error);
            }
        }
    });
}

setInterval(()=>{
    navigator.permissions.query({ name: "microphone" }).then((result) => {
        if(result.state == "denied"){
            alert("Permissions for Microphone were not given.\nPlease provide the permissions else you wont be able to give the test. Page will be reloaded in 20 seconds")
            setTimeout(()=>{
                location.reload();
            }, 20000)
        }
    })
    navigator.permissions.query({ name: "camera" }).then((result) => {
        if(result.state == "denied"){
            alert("Permissions for Camera were not given.\nPlease provide the permissions else you wont be able to give the test. Page will be reloaded in 20 seconds")
            setTimeout(()=>{
                location.reload();
            }, 20000)
        }
    })
}, 20000)

const video = document.getElementById('video');
const liveView = document.getElementById('liveView');
let localStream;
async function AudioVideoDetection(){
    count=0;
    try{
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        video.srcObject = localStream;
        socket.on('camera-required', userId => {
            connectToNewUser(userId, localStream);
        })
        audioDetection(localStream);
    }
    catch{
        if(count<3){
            count++;
        }
        return ;
    }
}
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    peers[userId] = call;
}

function connectToScreenUser(userId, stream) {
    const call = myPeerScreen.call(userId, stream);
    peersScreen[userId] = call;
}

function audioDetection(stream){
    // These levels must be in increasing order.
    level1=100;
    level2=150;
    level3=200;
    // When audioCounter reaches maxCounter an illegal attempt will be saved
    maxCounter=20;

    audioCounter=0;
    try{
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        javascriptNode.onaudioprocess = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var values = 0;

            var length = array.length;
            for (var i = 0; i < length; i++) {
                values += (array[i]);
            }

            var average = values / length;

            soundIntensity=Math.round(average);
            if(soundIntensity>level3){
                audioCounter+=3;
            }
            else if(soundIntensity>level2){
                audioCounter+=2;
            }
            else if(soundIntensity>level1){
                audioCounter+=1;
            }
            if(audioCounter>=maxCounter){
                audioCounter=0;
                var submissionId = document.getElementById("submissionId").value;
                var quizId = document.getElementById("quizId").value;
                var data = {
                    submissionId: submissionId
                };
                if(testStarted && detections.audioDetector){
                    try{
                        console.log('sending audio detection');
                        axios.post(quizId + '/audio', data);
                    }
                    catch(error){
                        console.log("Error :", error);
                    }
                }
            }
        }
    }
    catch{
        alert("No microphone was found. You can give the test but this malpractie will be saved.")
    }
}

numberOfTimesWindowsTimedOut=0;
const video1 = document.getElementById("video1");
var givingTest = false;

document.addEventListener("visibilitychange", function() {
    if(document.visibilityState == "visible"){
        return ;
    }
    if(numberOfTimesWindowsTimedOut<3){
        numberOfTimesWindowsTimedOut++;
        return ;
    }
    connectWithScreenRecorder();
    var submissionId = document.getElementById("submissionId").value;
    var quizId = document.getElementById("quizId").value;
    var data = {
        submissionId: submissionId
    };
    if(testStarted && detections.tabSwitchDetector){
        try{
            axios.post(quizId + '/windowBlurred', data);
        }
        catch(error){
            console.log("Error :", error);
        }
    }
});

$(window).focus(function() {
    givingTest = true;
});
$(window).blur(function() {
    if(numberOfTimesWindowsTimedOut<3){
        numberOfTimesWindowsTimedOut++;
    }
    givingTest = false;
});

setInterval(() => {
    if(document.visibilityState != "visible" || givingTest==false){
        connectWithScreenRecorder();
    }
}, 8000);

screenSharingTry=0;
totalTry=3;
oneTimeCalled=true;
screenNotShared = true;
async function startSharing() {
    var displayMediaOptions;
    if (navigator.appVersion.indexOf("Win") != -1){
        displayMediaOptions = {
            video: true,
            audio: true,
            displaySurface: "monitor",
        };
    }
    else{
        displayMediaOptions = {
            video: true,
            displaySurface: "monitor",
        };
    }
    try{
        let localStream = await navigator.mediaDevices.getDisplayMedia(
            displayMediaOptions
        );
        video1.srcObject = localStream;
        if(navigator.appVersion.indexOf("Win") != -1 && localStream.getTracks().length < 2){
            alert('Share your entire screen and check the "share system audio" checkbox');
            stopSharing();
            startSharing();
            return ;
        }
        socket.on('screen-required', userId => {
            connectToScreenUser(userId, localStream);
        })
        givingTest = true;
    } 
    catch (error) {
        alert(error+"\nUnable to capture the screen. We will try again.")
        startSharing();
        return;
    }
    if(video1.srcObject.getVideoTracks()[0].getSettings().displaySurface!="monitor"){
        stopSharing();
        startSharing();
        return ;
    }
    if(oneTimeCalled){
        oneTimeCalled=false;
        checkScreenSharing();
    }
    screenNotShared=false;
}

function stopSharing(){
    let tracks = video1.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    video1.srcObject = null;
}

function checkScreenSharing(){
    setInterval(function() {
        if(video1.srcObject["active"]==false && screenNotShared==false){
            screenNotShared=true;
            var submissionId = document.getElementById("submissionId").value;
            var quizId = document.getElementById("quizId").value;
            var data = {
                submissionId: submissionId
            };
            if(testStarted){
                try{
                    axios.post(quizId + '/screenSharingOff', data);
                }
                catch(error){
                    console.log("Error :", error);
                }
            }
            startSharing();
        }
    }, 5000);
}

function connectWithScreenRecorder(){
    if(video1.srcObject && video1.srcObject["active"]==true){
        let canvas = document.querySelector("#canvas1");
        canvas.width  = 150;
        canvas.height = 150;
        const context = canvas.getContext("2d");
        context.drawImage(video1, 0, 0, 150, 150);
        const frame = canvas.toDataURL();
        var submissionId = document.getElementById("submissionId").value;
        var quizId = document.getElementById("quizId").value;
        var data = {
            submissionId: submissionId,
            frame: frame,
            type: 796
        };
        if(testStarted && detections.tabSwitchDetector){
            try{
                axios.post(quizId + '/tabChanged', data);
            }
            catch(error){
                console.log("Error :", error);
            }
        }
        return 0;
    }
}

var model = undefined;
function enableCam() {
    if (!model) {
      return;
    }
    video.addEventListener('loadeddata', predictWebcam);
    // predictWebcam();
}

function predictWebcam() {
    model.detect(video).then(function (predictions) {
        var count = 0;
        let canvas = document.querySelector("#canvas");
        canvas.width  = 150;
        canvas.height = 150;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, 150, 150);
        const frame = canvas.toDataURL();
        var submissionId = document.getElementById("submissionId").value;
        var quizId = document.getElementById("quizId").value;
        for (let n = 0; n < predictions.length; n++) {
            if(predictions[n].score > 0.66){
                if(predictions[n].class === 'cell phone'){
                    var data = {
                        submissionId: submissionId,
                        frame: frame,
                        type: 554
                    };
                    if(testStarted && detections.mobileDetector){
                        try{
                            // console.log('mobile');
                            axios.post(quizId + '/mobileDetected', data);
                        }
                        catch(error){
                            console.log("Error :", error);
                        }
                    }
                }
                if(predictions[n].class === 'person'){
                    // console.log('face');
                    count++;
                }
            }
        }
        if(count > 1){
            var data = {
                submissionId: submissionId,
                frame: frame,
                type: 239
            };
            if(testStarted && detections.faceDetector){
                try{
                    // console.log('multiple face');
                    axios.post(quizId + '/multipleFace', data);
                }
                catch(error){
                    console.log("Error :", error);
                }
            }
        }
        else if(count === 0){
            var data = {
                submissionId: submissionId,
            };
            if(testStarted && detections.faceDetector){
                try{
                    // console.log('no person');
                    axios.post(quizId + '/noPerson', data);
                }
                catch(error){
                    console.log("Error :", error);
                }
            }
        }
        window.requestAnimationFrame(predictWebcam);
    });
}

function getTop(l) {
    return l
      .map((a) => a.y)
        .reduce((a, b) => Math.min(a, b));
}

function getMeanPosition(l) {
    return l
        .map((a) => [a.x, a.y])
        .reduce((a, b) => [a[0] + b[0], a[1] + b[1]])
        .map((a) => a / l.length);
}

async function headposeEstimationInitialise(){
  await faceapi.nets.tinyFaceDetector.load('/');
  await faceapi.loadFaceLandmarkModel('/')
}

async function headposeEstimation(){
  setInterval(async () => {
    if(!!faceapi.nets.tinyFaceDetector.params){
      let inputSize = parseInt(160)
      let scoreThreshold = 0.5
      const options = new faceapi.TinyFaceDetectorOptions({inputSize, scoreThreshold})
      let canvas = document.querySelector("#canvas");
      canvas.width  = 150;
      canvas.height = 150;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, 150, 150);
      const frame = canvas.toDataURL();
      const res = await faceapi.detectSingleFace(canvas, options).withFaceLandmarks();
      if (res) {
        var eye_right = getMeanPosition(res.landmarks.getRightEye());
        var eye_left = getMeanPosition(res.landmarks.getLeftEye());
        var nose = getMeanPosition(res.landmarks.getNose());
        var mouth = getMeanPosition(res.landmarks.getMouth());
        var jaw = getTop(res.landmarks.getJawOutline());

        var rx = (jaw - mouth[1]) / res.detection.box.height + 0.5;
        var ry = (eye_left[0] + (eye_right[0] - eye_left[0]) / 2 - nose[0]) /
          res.detection.box.width;

        console.log(
          res.detection.score,
          ry,
          rx
        );

        let state = "undetected";
        if (res.detection.score > 0.3) {
          state = "front";
          if (rx > 0.2) {
            state = "top";
          } else {
            if (ry < -0.04) {
              state = "left";
            }
            if (ry > 0.04) {
              state = "right";
            }
          }
        }
        console.log(state);
        if(state !== "undetected" && state !== "front" && testStarted){
            var quizId = document.getElementById("quizId").value;
            var submissionId = document.getElementById("submissionId").value;
            var data = {
                submissionId: submissionId,
                frame: frame,
                type: 211
            };
            try{
                axios.post(quizId + '/changeInHeadPose', data);
            }
            catch(error){
                console.log("Error :", error);
            }
        }
      }
    }
  }, 500);
}

function idMapping(ID){
    getMapping();
    mappedVal=0;
    for(i=ID.length-1; i>=0; i--){
        mappedVal+=Math.pow(35, i)*mappings[ID[i]];
    }
    return mappedVal;
}

function getMapping(){
	for(let i=0;i<azchar.length; i++){
		mappings[azchar[i]] = azchar[i].charCodeAt(0)-97;
	}
	for(let i=0;i<char01.length; i++){
		mappings[char01[i]] = char01[i].charCodeAt(0)-48+26;
	}
}

function shuffledArray(array, seed) {
    seed=idMapping(seed);
    var m = array.length, t, i;
    while (m) {
        i = Math.floor(random(seed) * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
        ++seed;
    }
    return array;
}

function random(seed) {
    var x = Math.sin(seed++) * 10000; 
    return x - Math.floor(x);
}