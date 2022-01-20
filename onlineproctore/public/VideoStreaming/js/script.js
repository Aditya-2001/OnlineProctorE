// var countDownDate = new Date("Jan 01, 2022 20:47:00").getTime();
const socket = io();
const videoGrid = document.getElementById('videoCard1');
const videoGrid1 = document.getElementById('videoCard2');
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
const myPeerScreen = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})
myPeer.on('open', id => {
    socket.emit('join-room1', ROOM_ID + '1', id);
})
myPeerScreen.on('open', id => {
    socket.emit('join-room2', ROOM_ID + '2', id);
})
function viewCamera(){
    socket.emit('camera-required');
    let myVideoStream;
    myPeer.on('call', call => {
        call.answer(myVideoStream);
        console.log('call recieved');
        const video = document.getElementById('video');
        call.on('stream', userVideoStream => {
            console.log('stream recieved');
            video.srcObject = userVideoStream;
        })
    })
};

function viewScreen(){
    socket.emit('screen-required');
    let myVideoStream;
    myPeerScreen.on('call', call => {
        call.answer(myVideoStream);
        console.log('call recieved 2');
        const video = document.getElementById('screen');
        call.on('stream', userVideoStream => {
            console.log('stream recieved 2');
            video.srcObject = userVideoStream;
        })
    })
};

function stop(){
    window.location.href = window.location.href.slice(0,window.location.href.indexOf('/viewStream'));
}

// Run myfunc every second
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
        window.location.href = window.location.href.slice(0,window.location.href.indexOf('/viewStream'));
    }
}, 1000);

var state=false;
$('#video').attr("width","100%");
const videoHeight = $('#video').outerHeight();
$( '#video' ).click(function(){
    if(document.body.clientWidth>=800 && document.body.clientWidth<=1100){
        if(state){
            $(this).attr("width","100%");
            $(this).attr("height","100%");
            $('#column1').addClass("col-apna-6");
            $('#videoCard1').attr("width","100%");
            $('#videoCard1').attr("height","100%");
            $('#videoCard1').css("z-index","0");
            $(this).css("z-index","0");
            $('#column2').css("display","unset");
            state = false;
        }else{
            $('#column1').removeClass("col-apna-6");
            $('#videoCard1').attr("width",document.body.clientWidth);
            // $(this).attr("height",document.body.clientHeight-80-$('#navubar').outerHeight());
            $(this).attr("width",$('#videoCard1').width());
            $('#videoCard1').css("z-index","1");
            $(this).css("z-index","1");
            $('#column2').css("display","none");
            state = true;
        }
    }
});
var state2=false;
$('#screen').attr("width", "100%");
$( '#screen' ).click(function(){
    if(document.body.clientWidth>=800 && document.body.clientWidth<=1100){
        if(state2){
            $(this).attr("width","100%");
            $(this).attr("height","100%");
            $('#column2').addClass("col-apna-6");
            $('#videoCard2').attr("width","100%");
            $('#videoCard2').attr("height","100%");
            $('#videoCard2').css("z-index","0");
            $(this).css("z-index","0");
            $('#column1').css("display","unset");
            state2 = false;
        }else{
            $('#column2').removeClass("col-apna-6");
            $('#videoCard2').attr("width",document.body.clientWidth);
            // $(this).attr("height",document.body.clientHeight-80-$('#navubar').outerHeight());
            $(this).attr("width",$('#videoCard2').width());
            $('#videoCard2').css("z-index","1");
            $(this).css("z-index","1");
            $('#column1').css("display","none");
            state2 = true;
        }
    }
});