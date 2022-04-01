let setHeight;
window.onload = function() {
    // start();
    getQuizQuestions();
};

var questionsType = new Map();
var optionsCount = new Map();
var questionMarking = new Map();
azchar = "abcdefghijklmnopqrstuvwxyz"
char01 = "0123456789"
var mappings = {};

function setMarks(){
    var questionId = $('.quiz-card').find('.ques-ans.active')[0].id;
    document.getElementById('mm').innerHTML = questionMarking.get(questionId).mm;
    document.getElementById('set').innerHTML = questionMarking.get(questionId).set;
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

async function getQuizQuestions(){
    var quizId = document.getElementById("quizId").value;
    try{
        const response = await axios.post('',{});
        const quiz = response.data.quiz;
        const questions = response.data.questions;
        var questionCount = questions.length;
        var shuffleOrder = [];
        for (var i=0; i<questionCount; i++){
            shuffleOrder.push(i);
        }
        shuffleOrder=shuffledArray(shuffleOrder, quizId);
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
            questionMarking.set(questions[j]._id, {'mm': questions[j].maximumMarks, 'nm': questions[j].negativeMarking, 'pm': questions[j].markingScheme, set: questions[j].set});
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
                    displayQuestion += ' disabled><i class="fa icon-checkbox"></i><span class="options" id="text' + (k+1) + questions[j]._id + '">' + questions[j].options[o] + '</span>';
                    if(questions[j].correctOptions.includes(questions[j].options[o])){
                        displayQuestion += '<i class="icon fa fa-check text-success fa-fw " title="Correct" aria-label="Correct"></i>';
                    }
                    displayQuestion += '</label><br>';
                }
                displayQuestion += '</div><div class="blank-space"></div></div>';
            }
            else{
                optionsCount.set(questions[j]._id, 1);
                displayQuestion += '"><textarea id="text1' + questions[j]._id + '" name="subjective" onkeydown=';
                displayQuestion += '"if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+\'\t\'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}" disabled></textarea></div><div class="blank-space"></div></div>';
            }
            $('#addQuestions').append(displayQuestion);
            if(i==0){
                setMarks();
            }
            if(!questions[j].mcq){
                var answer = $.trim($("#text1"+questions[j]._id).val());
                if(answer == ''){}
                else{
                    flag=true;
                }
            }
            var navigation = '<li><button id="display' + questions[j]._id + '" class="test-ques ';
            navigation += 'que-not-attempted';
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
    var quizId = document.getElementById('quizId').value;
    window.location.href = '/dashboard/faculty/quiz/'+quizId;
}

$(document).ready(function(){
    $('.next').click(function(){
        $('.quiz-card').find('.ques-ans.active').next().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').next().addClass('active');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('active');
        setMarks();
    })
    $('.prev').click(function(){
        $('.quiz-card').find('.ques-ans.active').prev().removeClass('none');
        $('.quiz-card').find('.ques-ans.active').prev().addClass('active');
        $('.quiz-card').find('.ques-ans.active').next().addClass('none');
        $('.quiz-card').find('.ques-ans.active').next().removeClass('active');
        setMarks();
    })
})
async function display(id){
    $('.quiz-card').find('.ques-ans.active').addClass('none');
    $('.quiz-card').find('.ques-ans.active').removeClass('active');
    document.getElementById(id).classList.add('active');
    document.getElementById(id).classList.remove('none');
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