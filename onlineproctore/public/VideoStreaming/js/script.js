// var countDownDate = new Date("Jan 01, 2022 20:47:00").getTime();
function view(){
    const peer = createPeer();
    peer.addTransceiver("video", { direction: "recvonly" });
    peer.addTransceiver("audio", { direction: "recvonly" });
    const peerScreen = createScreenPeer();
    peerScreen.addTransceiver("video", { direction: "recvonly" });
    peerScreen.addTransceiver("audio", { direction: "recvonly" });
    $('#stop').css("display", "unset");
    $('#view').css("display", "none");
};

function stop(){
    window.location.href = window.location.href.slice(0,window.location.href.indexOf('/viewStream'));
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };
    const { data } = await axios.post(window.location.href.slice(0,window.location.href.indexOf('/viewStream')) + '/viewCameraStream/submission/' + submissionId, payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function handleTrackEvent(e) {
    document.getElementById("video").srcObject = e.streams[0];
};

function createScreenPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = handleScreenTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededScreenEvent(peer);
    return peer;
}

async function handleNegotiationNeededScreenEvent(peer) {
    setTimeout(async ()=>{
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const payload = {
            sdp: peer.localDescription
        };
        const { data } = await axios.post(window.location.href.slice(0,window.location.href.indexOf('/viewStream')) + '/viewScreenStream/submission/' + submissionId, payload);
        const desc = new RTCSessionDescription(data.sdp);
        peer.setRemoteDescription(desc).catch(e => console.log(e));
    }, 1000);
}

function handleScreenTrackEvent(e) {
    document.getElementById("screen").srcObject = e.streams[0];
};

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