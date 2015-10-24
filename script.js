/**
 * Define all global variables here
 */
var student_array = [];
var gradeSum = null;

$(function(){
    /**
     * addClicked - Event Handler when user clicks the add button
     */
    $("button.btn-success").click(function(){
        addStudent();
    });

    /**
     * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
     */
    $("button.btn-default").click(function(){
        //clear form
        clearAddStudentForm();

    });

    /**
     * deleteClicked - Event Handler when user clicks a delete button, clear row data in student table
     */
    //$(".student-list-container").on('click', 'button.btn-danger', function(){
    //    $(this).parents("tr").remove();
    //});

}); //END doc ready function

/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 */



function addStudent() {
    //Check if input is empty or not a number
    var gradeCheck = $("#studentGrade").val();
    if(isNaN(gradeCheck) || gradeCheck === ""){
        return;
    }
    //Get student data from input form
    var name = $("#studentName").val();
    var course = $("#course").val();
    //store grade as integer
    var grade = parseInt(gradeCheck);

    //add grade to gradeSum
    gradeSum += grade;

    //store input data in object
    var studentObject = {
        name: name,
        course: course,
        grade: grade,
        delete: function(){
            for(var i in student_array){//for every index value in student array
                if(student_array[i] === studentObject){ //does the first index we're checking === literally this object that we're talking about? we know what object we're talking about because we included this specific reference in the click handler for the delete button we made
                    student_array.splice(i, 1);
                    console.log(student_array);
                    break;
                }

            }
        }
    };

    //place object in student_array
    student_array.push(studentObject);

    //add studentObject to HTML table in DOM
    var $newRow = $('<tr>');
    var $rowName = $('<td>').text(studentObject.name);
    var $rowCourse = $('<td>').text(studentObject.course);
    var $rowGrade = $('<td>').text(studentObject.grade);
    var $deleteButton = $('<button>', {
            class: "btn btn-danger",
            text: "Delete"
        });

    //assign click handler to delete button
    $deleteButton.click(function(){
       $(this).parent().remove();
        studentObject.delete(); //before we ship off this row and the button to the DOM, these are all associated with the object we just made above!
    });




    $newRow.append($rowName);
    $newRow.append($rowCourse);
    $newRow.append($rowGrade);
    $newRow.append($deleteButton);

    $('.student-list').append($newRow);


    //calculate & update grade average
    calculateAverage();

    //clear form
    clearAddStudentForm();
}//end addStudent function

/**
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentForm() {
    $("#studentName").val("");
    $("#course").val("");
    $("#studentGrade").val("");
}

/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 */
function calculateAverage(){
    //calculate average
    var gradeAvg = Math.round(gradeSum/student_array.length);

    //display grade Avg on screen
    $(".avgGrade").text(gradeAvg);
}


/**
 * reset - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */


/**
 * Listen for the document to load and reset the data to the initial state
 */


