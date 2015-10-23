/**
 * Define all global variables here
 */
var student_array = [];
var gradeSum = null;

$(function(){
    /**
     * addClicked - Event Handler when user clicks the add button
     */
    $("button.btn-success").click(function () {
        addStudent();
    });

    /**
     * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
     */
    $("button.btn-default").click(function () {
        //clear form
        clearAddStudentForm();
    });

}); //END doc ready function

/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 */
function addStudent() {
    //Get student data from input form
    var name = $("#studentName").val();
    var course = $("#course").val();
    //store grade as integer
    var grade = parseInt($("#studentGrade").val());

    //add grade to gradeSum
    gradeSum += grade;

    //store data in object
    var StudentObject = {
        studentName: name,
        studentCourse: course,
        studentGrade: grade
    };

    for(var i = 0; i < StudentObject.length; i++){
        /*$(tr).append(StudentObject[i]);*/
        console.log(StudentObject[i]);
    };

    //add object to table
    addStudentToDom(StudentObject);

    //place object in student_array
    student_array.push(StudentObject);

    //calculate & update grade average
    calculateAverage();

    //clear form
    clearAddStudentForm();
};


/**
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentForm() {
    $("#studentName").val("");
    $("#course").val("");
    $("#studentGrade").val("");
};

/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 */

function calculateAverage(){
    //calculate average
    var gradeAvg = Math.round(gradeSum/student_array.length);

    //display grade Avg on screen
    $(".avgGrade").text(gradeAvg);
};

/**
 * updateData - centralized function to update the average and call student list update
 */

/**
 * updateStudentList - loops through global student array and appends each objects data into the student-list-container > list-body
 */

/**
 * addStudentToDom - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param object
 */




/**
 * reset - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */


/**
 * Listen for the document to load and reset the data to the initial state
 */


