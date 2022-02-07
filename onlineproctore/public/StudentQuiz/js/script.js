let setHeight;
window.onload = function() {
    // start();
    getQuizQuestions();
    setHeight = setInterval(()=>{
        $('#navigationBar').height($('#addQuestions').height());
    }, 1000)
};

var questionsType = new Map();
var optionsCount = new Map();

async function getQuizQuestions(){
    var quizId = document.getElementById("quizId").value;
    console.log('function called');
    try{
        const response = await axios.post(quizId+'/getQuestions',{});
        const quiz = response.data.quiz;
        const questions = response.data.questions;
        const questionSubmissions = response.data.questionSubmissions;
        var questionCount = questions.length;
        var shuffleOrder = [];
        for (var i=0; i<questionCount; i++){
            shuffleOrder.push(i);
        }
        for (var i=0; i<questionCount; i++){
            var j = shuffleOrder[Math.floor(Math.random() * (questionCount-i))];
            shuffleOrder.splice(shuffleOrder.indexOf(j), 1);
            var displayQuestion = '<div class="ques-ans';
            if(i==0){
                displayQuestion += ' active"';
            }
            else{
                displayQuestion += ' none"';
            }
            var submission = questionSubmissions.find( ({question}) => question._id === questions[j]._id);
            displayQuestion += 'id="' + questions[j]._id + '"><div class="question"><table class="qtable"><tr><td class="quest"><span class="que">Q</span><span class="question-number">';
            displayQuestion += (i+1) + '.</span>' + questions[j].question + '</td><td class="marks"><table class="marks-table"><tr><td>MM:'+ questions[j].maximumMarks +'</td></tr><tr><td>';
            if(submission.checked){
                displayQuestion += 'Marks: <span class="marks-assigned-';
                if(submission.marksObtained <= 0){
                    displayQuestion += 'zero"> 0';
                }
                else{
                    displayQuestion += 'positive">'+ submission.marksObtained;
                }
            }
            else{
                displayQuestion += '<span class="marks-assigned-zero"> Not Checked';
            }
            displayQuestion += '</span></td></tr></table></td></tr></table>';
            displayQuestion += '<div style="text-align: center;">'
            for(var ic=0; ic<questions[j].imageLinks.length; ic++){
                displayQuestion += '<img class="questionImg" src="https://drive.google.com/uc?export=view&id='+questions[j].imageLinks[ic].split('/').reverse()[1]+'">';
            }
            displayQuestion += '</div></div> <hr><div class="answer';
            questionsType.set(questions[j]._id, questions[j].mcq);
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
                    displayQuestion += '<label><input type="checkbox" name="option' + (k+1) + '" value="option' + (k+1) + '" id="option' + (k+1) + questions[j]._id + '"';
                    if(submission.optionsMarked.includes(questions[j].options[o])){
                        displayQuestion += ' checked';
                        flag = true;
                    }
                    displayQuestion += ' disabled><i class="fa icon-checkbox"></i><span class="options" id="text' + (k+1) + questions[j]._id + '">' + questions[j].options[o] + '</span>';
                    if(submission.checked){
                        // submission.optionsMarked.includes(questions[j].options[o]) && 
                        if(questions[j].correctOptions.includes(questions[j].options[o])){
                            displayQuestion += '<i class="icon fa fa-check text-success fa-fw " title="Correct" aria-label="Correct"></i>';
                        }
                        else if(submission.optionsMarked.includes(questions[j].options[o])){
                            displayQuestion += '<i class="icon fa fa-remove text-danger fa-fw red" title="Incorrect" aria-label="Incorrect"></i>';
                        }
                    }
                    displayQuestion += '</label><br>';
                }
                displayQuestion += '</div></div>';
            }
            else{
                optionsCount.set(questions[j]._id, 1);
                displayQuestion += '"><textarea id="text1' + questions[j]._id + '" name="subjective" onkeydown=';
                displayQuestion += '"if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+\'\t\'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}" disabled></textarea></div></div>';
            }
            $('#addQuestions').append(displayQuestion);
            if(!questions[j].mcq){
                document.getElementById("text1"+questions[j]._id).value = submission.textfield;
                var answer = $.trim($("#text1"+questions[j]._id).val());
                if(answer == ''){}
                else{
                    flag=true;
                }
            }
            var navigation = '<li><button id="display' + questions[j]._id + '" class="test-ques ';
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
            navigation += (i+1) + '</button></li>';
            // console.log(navigation);
            $('#navigator').append(navigation);
        }
    }
    catch(error){
        console.log(error);
    }
}

function goBack(){
    var courseId = document.getElementById('courseId').value;
    window.location.href = '/dashboard/user/course/'+courseId;
}

$(document).ready(function(){
    $('.next').click(function(){
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
        clearInterval(setHeight);
        $('#navigationBar').height($('#addQuestions').height());
    })
    $('.prev').click(function(){
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('active');
        $('.quiz-card').find('.ques-ans.active').next().addClass('none');
        $('.quiz-card').find('.ques-ans.active').next().removeClass('active');
        clearInterval(setHeight);
        $('#navigationBar').height($('#addQuestions').height());
    })
})
async function display(id){
    $('.quiz-card').find('.ques-ans.active').addClass('none');
    $('.quiz-card').find('.ques-ans.active').removeClass('active');
    document.getElementById(id).classList.add('active');
    document.getElementById(id).classList.remove('none');
}