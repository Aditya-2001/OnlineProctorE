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
var myfunc = setInterval(function() {
    var now = new Date().getTime();
    var timeleft = countDownDate - now;
        
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

let editor;
window.onload = function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/c_cpp");
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
        // editor.session.setValue("/* Your Code Goes Here */");
    }
    else if(language == 'java'){
        editor.session.setMode("ace/mode/java");
    //     editor.session.setValue("/* Your Code Goes Here */");
    }
    else if(language == 'python'){
        editor.session.setMode("ace/mode/python");
        // editor.session.setValue("# Your Code Goes Here");
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

function copy_code(){
    // navigator.clipboard.writeText(document.getElementsByClassName("ace_text-layer")[0].innerText);
    console.log(document.getElementsByClassName("ace_text-layer")[0].innerHTML)
    navigator.clipboard.writeText(document.getElementsByClassName("ace_text-layer")[0].innerHTML);
    copy_helper("content_copy","done_all");
}

function copy_testcase(num){
    copy_helper("not-copied"+num,"copied"+num);
}