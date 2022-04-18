var wid;
var leftTime=10;
var testStarted = true;
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

var quizId = document.getElementById("quizId").value;
var time = axios.post(quizId + '/getTime', {});
var timechange = false;
time.then( t => {
    var now = t.data.time;
    countDownDate = t.data.countDownDate;
    if(t.data.redirect){
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

        if(timeleft < 5*60*1000 && !timechange){
            time = axios.post(quizId + '/getTime', {});
            timechange = true;
            time.then(t1 => {
                now = t1.data.time;
                countDownDate = t1.data.countDownDate;
                if(t1.data.redirect){
                    window.location.href = t1.data.url;
                }
            })
        }

        // Display the message when countdown is over
        if (timeleft < 0) {
            clearInterval(myfunc);
            document.getElementById("hours").innerHTML = "" 
            document.getElementById("mins").innerHTML = ""
            document.getElementById("secs").innerHTML = ""
            document.getElementById("end").innerHTML = "TIME UP!!";
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

async function start(){
    let video = document.querySelector("#video");
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
}

function submitTest(){
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

function openQuestion(id, num, question, maximumMarks, questionImageLinks, inputFormat, outputFormat, constraints, sampleTestCaseGiven, sampleInputTestCase, sampleOutputTestCase, sampleTestCaseExplanationGiven, sampleTestCaseExplanation, explanationImageLinks){
    changeDiv('labDescription')
    document.getElementById('questionId').value = id.slice(1,id.length-1);
    document.getElementById('QuestionNumber').innerText = num+'.';
    document.getElementById('Question').innerText = question.slice(1,question.length-1);
    var qilinks = '';
    questionImageLinks = JSON.parse(questionImageLinks);
    for(var i=0;i<questionImageLinks.length;i++){
        qilinks+='<img src="https://drive.google.com/uc?export=view&id='+questionImageLinks[i].split('/').reverse()[1]+'" alt="image" style="width: 90%; height: auto;"><br>';
    }
    document.getElementById('questionImageLinks').innerHTML = qilinks;
    document.getElementById('inputFormat').innerText = inputFormat.slice(1,inputFormat.length-1);
    document.getElementById('outputFormat').innerText = outputFormat.slice(1,outputFormat.length-1);
    constraints = JSON.parse(constraints);
    constraintsHTML = '';
    for(var i=0;i<constraints.length;i++){
        constraintsHTML+='<li id="constraint'+(i+1)+'"></li>'
    }
    document.getElementById('constraints').innerHTML = constraintsHTML;
    for(var i=0;i<constraints.length;i++){
        document.getElementById('constraint'+(i+1)).innerText = constraints[i];
    }
    if(document.getElementById('sampleTestCaseGiven').classList.contains('none')){
        document.getElementById('sampleTestCaseGiven').classList.remove('none');
    }
    if(document.getElementById('runCode').classList.contains('none')){
        document.getElementById('runCode').classList.remove('none');
    }
    if(!JSON.parse(sampleTestCaseGiven)){
        document.getElementById('sampleTestCaseGiven').classList.add('none');
        document.getElementById('runCode').classList.add('none');
        return;
    }
    document.getElementById('sampleInputTestCase').innerText = sampleInputTestCase.slice(1,sampleInputTestCase.length-1);
    document.getElementById('sampleOutputTestCase').innerText = sampleOutputTestCase.slice(1,sampleOutputTestCase.length-1);
    if(document.getElementById('sampleTestCaseExplanationGiven').classList.contains('none')){
        document.getElementById('sampleTestCaseExplanationGiven').classList.remove('none');
    }
    if(!JSON.parse(sampleTestCaseExplanationGiven)){
        document.getElementById('sampleTestCaseExplanationGiven').classList.add('none');
    }
    else{
        document.getElementById('sampleTestCaseExplanation').innerText = sampleTestCaseExplanation.slice(1,sampleTestCaseExplanation.length-1);
    }
    var eilinks = '';
    explanationImageLinks = JSON.parse(explanationImageLinks);
    for(var i=0;i<explanationImageLinks.length;i++){
        eilinks+='<img src="https://drive.google.com/uc?export=view&id='+explanationImageLinks[i].split('/').reverse()[1]+'" alt="image" style="width: 90%; height: auto;"><br>';
    }
    document.getElementById('explanationImageLinks').innerHTML = eilinks;
}

function fullscreen(flag, id1, id2){
    if(flag){
        document.getElementById('resize1').classList.remove('col-lg-4');
        document.getElementById('resize1').classList.add('col-md-12');
        document.getElementById('resize2').classList.remove('col-lg-8');
        document.getElementById('resize2').classList.add('col-md-12');
    }
    else{
        document.getElementById('resize1').classList.add('col-lg-4');
        document.getElementById('resize1').classList.remove('col-md-12');
        document.getElementById('resize2').classList.add('col-lg-8');
        document.getElementById('resize2').classList.remove('col-md-12');
    }
    document.getElementById(id1).classList.add('none');
    document.getElementById(id2).classList.remove('none');
}

document.getElementById('upload')
    .addEventListener('change', function() {
    var fr=new FileReader();
    fr.onload=function(){
        editor.session.setValue(fr.result);
    }
    fr.readAsText(this.files[0]);
})

function openRunModal(){
    document.getElementById('sampleInputTestCaseModal').innerText = document.getElementById('sampleInputTestCase').innerText;
    document.getElementById('sampleOutputTestCaseExpectedModal').innerText = document.getElementById('sampleOutputTestCase').innerText;
    document.getElementById('sampleOutputTestCaseModal').innerText = document.getElementById('sampleOutputTestCase').innerText;
    runCode();
}

function openSubmitModal(testCaseFrequency){
    testCaseFrequency = JSON.parse(testCaseFrequency);
    testCaseCountHTML = '';
    var questionId = document.getElementById('questionId').value;
    for(var i=0;i<testCaseFrequency[questionId];i++){
        testCaseCountHTML += '<div class="col-md-4 col-6"><i class="icon fa fa-check text-success fa-fw"></i><span class="correct-test">Test Case'+ (i+1)+'</span></div>';
    }
    document.getElementById('finalTestCaseDisplay').innerHTML = testCaseCountHTML;
}

async function runCode(){
    var questionId = document.getElementById('questionId').value;
    var quizId = document.getElementById('quizId').value;
    var submissionId = document.getElementById("submissionId").value;
    var code = editor.getValue();
    var language;
    if(editor.session.$modeId.includes('python'))
        language = 'python';
    else if(editor.session.$modeId.includes('cpp'))
        language = 'cpp';
    else if(editor.session.$modeId.includes('c'))
        language = 'c';
    else if(editor.session.$modeId.includes('java'))
        language = 'java';
    document.getElementById('sampleOutputTestCaseModal').innerHTML = '';
    if(!document.getElementById('testCasePass').classList.contains('none')){
        document.getElementById('testCasePass').classList.add('none');
    }
    if(!document.getElementById('testCaseFail').classList.contains('none')){
        document.getElementById('testCaseFail').classList.add('none');
    }
    if(!document.getElementById('testCaseError').classList.contains('none')){
        document.getElementById('testCaseError').classList.add('none');
    }
    try{
        var data = {language: language, code: code, questionId: questionId, submissionId: submissionId};
        var response = await axios.post(quizId+'/runCode', data);
        var result = response.data;
        document.getElementById('sampleOutputTestCaseModal').innerHTML = result.stdout;
        if(result.success){
            document.getElementById('testCasePass').classList.remove('none');
        }
        else{
            document.getElementById('testCaseFail').classList.remove('none');
            if(result.exitCode != 0 || result.stderr != '' || result.errorType != undefined){
                document.getElementById('testCaseError').classList.remove('none');
                var stderr = result.stderr;
                if(stderr == '')
                    stderr = result.errorType;
                document.getElementById('testCaseError').innerHTML = stderr;
            }
        }
    }catch(error){
        console.log("Error :", error);
    }
}

$(document).ready(function() {

    $(".CopyColumn").click(function(){
        var btn = $(this);
        // Disable the button whilst the clipboard copy is performed
        btn.prop("disabled", true);
        var colData = "";
        // Use a line break to seperate the column data if no separator is specified
        var colSeparator = (btn.data("separator")===undefined) ? "\n" : btn.data("separator");
        // Loop through all elements with the target class
        $(btn.data("target")).each(function() {
            // Collect the column data and add the separator
            colData += $(this).text() + colSeparator;
        });
        // Copy the column data to the clipboard
        copyToClipboard(colData.trim());
        // Revert the button text after 1.5 seconds
        setTimeout(function(){
            // Enable the button
            btn.prop("disabled", false);
        },1500);
    });
    $('.dtBasicExample').DataTable({
            "ordering": false
        });
    $('.dataTables_length').addClass('bs-select');
});

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text); 
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

let editor,submissionEditor;
window.onload = function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/c_cpp");
    submissionEditor = ace.edit("submissionEditor");
    submissionEditor.setReadOnly(true);
    submissionEditor.setTheme("ace/theme/monokai");
    // editor.session.setValue("/* Your Code Goes Here */");
}

function changeTheme() {
    let theme = $("#themes").val();
    if(theme == 'monokali') editor.setTheme("ace/theme/monokai");
    else if(theme == 'ambiance') editor.setTheme("ace/theme/ambiance");
    else if(theme == 'cobalt') editor.setTheme("ace/theme/cobalt");
    else if(theme == 'eclipse') editor.setTheme("ace/theme/eclipse");
    else if(theme == 'github') editor.setTheme("ace/theme/github");
    else if(theme == 'solarized_light') editor.setTheme("ace/theme/solarized_light");
    else if(theme == 'terminal') editor.setTheme("ace/theme/terminal");
    else if(theme == 'xcode') editor.setTheme("ace/theme/xcode");
}

function changeLanguage() {
    let language = $("#languages").val();
    if(language == 'c' || language == 'cpp'){
        editor.session.setMode("ace/mode/c_cpp");
    }
    else if(language == 'java'){
        editor.session.setMode("ace/mode/java");
    }
    else if(language == 'python'){
        editor.session.setMode("ace/mode/python");
    }
}

$(function(){
    $("#upload_link").on('click', function(e){
        e.preventDefault();
        $("#upload:hidden").trigger('click');
    });
});

function copy_helper(id1,id2){
    document.getElementById(id1).style.display="none";
    document.getElementById(id2).style.display="inline-block";
    setTimeout(function() {
        document.getElementById(id2).style.display="none";
        document.getElementById(id1).style.display="inline-block";
    }, 1000);
}

function copy_code(flag){
    if(flag){
        navigator.clipboard.writeText(editor.getValue());
        copy_helper("content_copy","done_all");
    }
    else{
        navigator.clipboard.writeText(submissionEditor.getValue());
        copy_helper("content_copy1","done_all1");
    }
}

function copy_testcase(num){
    copy_helper("not-copied"+num,"copied"+num);
}


function changeDiv(id){
    var currId = $('.descBar.selectd-page')[0].id;
    document.getElementById(currId + '1').classList.add('none');
    document.getElementById(currId).classList.remove('selectd-page');
    document.getElementById(id).classList.add('selectd-page');
    document.getElementById(id+'1').classList.remove('none');
}