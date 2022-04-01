async function updateTable(){
  const quizId = document.getElementById('quizId').value;
  try{
    var {data} = await axios.post('', {});
    var submissions = data.submissions;
    const quizHeld = document.getElementById('quizHeld').value;
    if(quizHeld === 'true'){
      submissions = submissions.sort((a,b) => {
        var val = 1;
        if((a.writtenScore+a.mcqScore) > (b.writtenScore+b.mcqScore))
          val = -1;
        else if((a.writtenScore+a.mcqScore) == (b.writtenScore+b.mcqScore) && a.browserSwitched > b.browserSwitched)
          val = -1;
        else if((a.writtenScore+a.mcqScore) == (b.writtenScore+b.mcqScore) && a.browserSwitched == b.browserSwitched && a.mobileDetected > b.mobileDetected)
          val = -1;
        else if((a.writtenScore+a.mcqScore) == (b.writtenScore+b.mcqScore) && a.browserSwitched == b.browserSwitched && a.mobileDetected == b.mobileDetected && a.multiplePerson > b.multiplePerson)
          val = -1;
        else if((a.writtenScore+a.mcqScore) == (b.writtenScore+b.mcqScore) && a.browserSwitched == b.browserSwitched && 
          a.mobileDetected == b.mobileDetected && 
          a.multiplePerson == b.multiplePerson &&
          a.changeInHeadPose > b.changeInHeadPose)
          val = -1;
        else if((a.writtenScore+a.mcqScore) == (b.writtenScore+b.mcqScore) && a.browserSwitched == b.browserSwitched && 
          a.mobileDetected == b.mobileDetected && 
          a.multiplePerson == b.multiplePerson &&
          a.changeInHeadPose == b.changeInHeadPose &&
          a.audioDetected > b.audioDetected)
          val = -1;
        return val;
      })
    }else{
      submissions = submissions.sort((a,b) => {
        var val = 1;
        if(a.browserSwitched > b.browserSwitched)
          val = -1;
        else if(a.browserSwitched == b.browserSwitched && a.mobileDetected > b.mobileDetected)
          val = -1;
        else if(a.browserSwitched == b.browserSwitched && a.mobileDetected == b.mobileDetected && a.multiplePerson > b.multiplePerson)
          val = -1;
        else if(a.browserSwitched == b.browserSwitched && 
          a.mobileDetected == b.mobileDetected && 
          a.multiplePerson == b.multiplePerson &&
          a.changeInHeadPose > b.changeInHeadPose)
          val = -1;
        else if(a.browserSwitched == b.browserSwitched && 
          a.mobileDetected == b.mobileDetected && 
          a.multiplePerson == b.multiplePerson &&
          a.changeInHeadPose == b.changeInHeadPose &&
          a.audioDetected > b.audioDetected)
          val = -1;
        return val;
      })
    }
    document.getElementById('viewDetailAnalysisBody').innerHTML = "";
    var tbody = document.getElementById('viewDetailAnalysisBody');
    for(const submission of submissions){
      var html = '<tr><td>'+submission.user.username.toUpperCase()+'</td>';
      if(quizHeld === 'true'){
        html += '<td><a href=\'viewDetailAnalysis/submission/' + submission._id + '\'class="btn btn-primary">view</a></td><td>'+ submission.mcqScore + submission.writtenScore + '</td>';
      }
      else{
        html += '<td><a href=\'viewDetailAnalysis/viewStream/submission/' + submission._id + '\'class="btn btn-primary">view</a></td>'
      }
      html += '<td>'+ submission.browserSwitched +'</td>';
      html += '<td>'+ submission.mobileDetected +'</td>';
      html += '<td>'+ submission.multiplePerson +'</td>';
      html += '<td>'+ submission.changeInHeadPose +'</td>';
      html += '<td>'+ submission.audioDetected +'</td>';
      html += '<td>'+ submission.ipAddress +'</td>';
      tbody.insertAdjacentHTML("beforeend", html);
    }
  }catch(error){
    console.log(error.response);
  }
}
if(window.location.pathname.split('/')[window.location.pathname.split('/').length - 1] == "viewDetailAnalysis"){
  updateTable();
  setInterval(async ()=> {
    updateTable();
  }, 10000);
}