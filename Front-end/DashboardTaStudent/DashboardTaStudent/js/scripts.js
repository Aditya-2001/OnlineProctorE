if(document.body.clientWidth<992){
    document.getElementById("profTemp").setAttribute("data-toggle","");
    document.getElementById("profTemp").setAttribute("data-target","");
    document.getElementById("passTemp").setAttribute("data-toggle","");
    document.getElementById("passTemp").setAttribute("data-target","");
    document.getElementById("profTemp").setAttribute("href","Profile.html");
    document.getElementById("passTemp").setAttribute("href","Password.html");
}

$(document).ready(function () {
    $('.dtBasicExample').DataTable({
        "aaSorting": [[ 4, "desc" ], [ 5, "desc" ], [ 6, "desc" ], [ 7, "desc" ], [ 8, "desc" ], [ 9, "desc" ]]
    });
    $('.dtBasicExample1').DataTable();
    $('.dataTables_length').addClass('bs-select');
});