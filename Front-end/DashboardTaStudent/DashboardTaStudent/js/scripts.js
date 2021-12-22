if(document.body.clientWidth<992){
    document.getElementById("profTemp").setAttribute("data-toggle","");
    document.getElementById("profTemp").setAttribute("data-target","");
    document.getElementById("passTemp").setAttribute("data-toggle","");
    document.getElementById("passTemp").setAttribute("data-target","");
    document.getElementById("profTemp").setAttribute("href","Profile.html");
    document.getElementById("passTemp").setAttribute("href","Password.html");
}

$(document).ready(function () {
    $('.dtBasicExample').DataTable();
    $('.dtBasicExample1').DataTable();
    $('.dataTables_length').addClass('bs-select');
});