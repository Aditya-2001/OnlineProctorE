$(document).ready(function () {
  const quizHeld = document.getElementById('quizHeld').value;
  if(quizHeld === 'true'){
    $('.dtBasicExample2').DataTable({
      "aaSorting": [[ 2, "desc" ], [ 3, "desc" ], [ 4, "desc" ], [ 5, "desc" ], [ 6, "desc" ], [ 7, "desc" ]]
    });
  }
  else{
    $('.dtBasicExample2').DataTable({
      "aaSorting": [[ 2, "desc" ], [ 3, "desc" ], [ 4, "desc" ], [ 5, "desc" ], [ 6, "desc" ]]
    });
  }
});

setInterval(()=> {
  window.location.reload();
}, 60000);