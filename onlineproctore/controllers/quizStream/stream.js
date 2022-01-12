const Submission = require('../../models/submission');
const webrtc = require('wrtc');

let cameraStream = {};
let screenStream = {};

exports.viewStudentStream = async (req, res) => {
  const submissionId = req.submissionId;
  await Submission.findOne({_id: submissionId}, async (err, submission) => {
    return res.status(200).render('videoStreaming/stream', {submission: submission});
  }).clone().catch(function(err){ console.log(err)});
}

exports.getStudentCameraStream = async (req, res) => {
  var payload;
  try{
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    });
    const id = req.submissionId;
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    cameraStream[id].getTracks().forEach(track => peer.addTrack(track, cameraStream[id]));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    payload = {
      sdp: peer.localDescription
    }
  }catch(e){
    console.log(e);
  }
  res.json(payload);
}

exports.uploadStudentCameraStream = async (req, res) => {
  var payload;
  try{
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    });
    peer.ontrack = (e) => handleTrackEvent(e, peer, body.submissionId);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    payload = {
      sdp: peer.localDescription
    }
  }catch(e){
    console.log(e);
  }
  res.json(payload);
}

function handleTrackEvent(e, peer, id){
  cameraStream[id] = e.streams[0];
};

exports.getStudentScreenStream = async (req, res) => {
  console.log(screenStream);
  try{
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    });
    const id = req.submissionId;
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    screenStream[id].getTracks().forEach(track => peer.addTrack(track, screenStream[id]));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    payload = {
      sdp: peer.localDescription
    }
  }catch(e){
    console.log(e);
  }
  res.json(payload);
}

exports.uploadStudentScreenStream = async (req, res) => {
  var payload;
  try{
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        }
      ]
    });
    peer.ontrack = (e) => handleScreenTrackEvent(e, peer, body.submissionId);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    payload = {
      sdp: peer.localDescription
    }
  }catch(e){
    console.log(e);
  }
  res.json(payload);
}

function handleScreenTrackEvent(e, peer, id){
  screenStream[id] = e.streams[0];
};