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
  try{
    console.log(cameraStream);
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        },
        {
          urls: ['turn:turn.bistri.com:80'],
          credential: 'homeo',
          username: 'homeo',
          credentialType: 'password'
        }
      ]
    });
    const id = req.submissionId;
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    if(cameraStream[id]){
      cameraStream[id].getTracks().forEach(track => peer.addTrack(track, cameraStream[id]));
    }
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription
    }
    res.json(payload);
  }catch (e){
    res.json({sdp: 1});
  }
}

exports.uploadStudentCameraStream = async (req, res) => {
  try{
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        },
        {
          urls: ['turn:turn.bistri.com:80'],
          credential: 'homeo',
          username: 'homeo',
          credentialType: 'password'
        }
      ]
    });
    peer.ontrack = (e) => handleTrackEvent(e, peer, body.submissionId);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription
    }
    res.json(payload);
  }catch (e){
    res.json({sdp: 1});
  }
}

function handleTrackEvent(e, peer, id){
  cameraStream[id] = e.streams[0];
};

exports.getStudentScreenStream = async (req, res) => {
  try{
    setTimeout(async ()=>{
      console.log(screenStream);
      var body = req.body;
      const peer = new webrtc.RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.stunprotocol.org"
          },
          {
            urls: ['turn:turn.bistri.com:80'],
            credential: 'homeo',
            username: 'homeo',
            credentialType: 'password'
          }
        ]
      });
      const id = req.submissionId;
      const desc = new webrtc.RTCSessionDescription(body.sdp);
      await peer.setRemoteDescription(desc);
      if(screenStream[id]){
        screenStream[id].getTracks().forEach(track => peer.addTrack(track, screenStream[id]));
      }
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      const payload = {
        sdp: peer.localDescription
      }
      res.json(payload);
    }, 1000);
  }catch(e){
    res.json({sdp: 1});
  }
}

exports.uploadStudentScreenStream = async (req, res) => {
  try{
    var body = req.body;
    const peer = new webrtc.RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        },
        {
          urls: ['turn:turn.bistri.com:80'],
          credential: 'homeo',
          username: 'homeo',
          credentialType: 'password'
        }
      ]
    });
    peer.ontrack = (e) => handleScreenTrackEvent(e, peer, body.submissionId);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = {
      sdp: peer.localDescription
    }
    res.json(payload);
  }catch(e){
    res.json({sdp: 1});
  }
}

function handleScreenTrackEvent(e, peer, id){
  screenStream[id] = e.streams[0];
};