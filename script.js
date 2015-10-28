/**
 * Define all global variables here
 */
var student_array = [];
// variables to hold #studentName, #course, #studentGrade
var $nameEl;
var $courseEl;
var $gradeEl;

$(function(){
    /**
     * addClicked - Event Handler when user clicks the add button
     */
    $(".btn-success").click(function(){
        addStudent();
    });

    /**
     * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
     */
    $("button.btn-default").click(function(){
        //clear form
        clearAddStudentForm();
    });

    //assign values to variables
    $nameEl = $("#studentName");
    $courseEl = $("#course");
    $gradeEl = $("#studentGrade");

}); //END doc ready function


/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 */

function addStudent() {
    //Check if input is empty
    var studentVal = $nameEl.val();
    var courseVal = $courseEl.val();
    var gradeVal= $gradeEl.val();

    if(studentVal === "" || courseVal === "" || gradeVal === "" || isNaN(gradeVal) || 0 > gradeVal || gradeVal > 100) {
        $(".validation").remove();
        $nameEl.removeAttr('style');
        $courseEl.removeAttr('style');
        $gradeEl.removeAttr('style');
        //if Student Name is empty
        if(studentVal === ""){
            //Insert text telling user to input name
            $nameEl.parent().after("<div style='color:red' class='validation'>Student Name Required</div>");
            $nameEl.focus();
            //change border of required field
            $nameEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
            $("#studentName").val("");

        }

        //if Student Course is empty
        if(courseVal === ""){
            //Insert text telling user to input course
            $courseEl.parent().after("<div style='color:red' class='validation'>Student Course Required</div>");
            $courseEl.focus();
            //change border of required field
            $courseEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
            $("#course").val("");

        }

        //if Student Grade is empty or NaN
        if (isNaN(gradeVal) || gradeVal === "" || 0 > gradeVal || gradeVal > 100) {
            //Insert text telling user to input grade
            $gradeEl.parent().after("<div style='color:red' class='validation'>Number Grade Required</div>");
            $gradeEl.focus();
            //change border of required field
            $gradeEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
            $gradeEl.val("");
        }

        return;
    } // end if(

    $gradeEl.removeAttr('style');
    $(".validation").remove();
    //Get student data from input form
    var name = studentVal;
    var course = courseVal;
    //store grade as integer
    var grade = parseInt(gradeVal);

    //store input data in object
    var studentObject = {
        name: name,
        course: course,
        grade: grade,
        delete: function(){
            for(var i in student_array){//for every index value in student array
                if(student_array[i] === this){ //does the first index we're checking === literally this object that we're talking about? we know what object we're talking about because we included this specific reference in the click handler for the delete button we made
                    student_array.splice(i, 1);//if true, now we know that the index that we're on. the value needs to be removed.
                    console.log(student_array);
                    calculateAverage();
                    break;
                }
            }
        }
    };

    //place object in student_array
    student_array.push(studentObject);

    //add studentObject to HTML table in DOM    row start
    var $newRow = $('<tr>');
    var $rowName = $('<td>').text(studentObject.name);
    var $rowCourse = $('<td>').text(studentObject.course);
    var $rowGrade = $('<td>').text(studentObject.grade);
    var $deleteButton = $('<button>').addClass('btn btn-danger').text('Delete').click(function(){ //look at this awesome
    // long chain
        $(this).parents("tr").remove();
        studentObject.delete();
    });
    var $tdDeleteButton = $('<td>');

 //before we ship off this row and the button to the DOM, these are all associated with the object we just made above!

    //ship row to DOM
    $newRow.append($rowName);
    $newRow.append($rowCourse);
    $newRow.append($rowGrade);
    $tdDeleteButton.append($deleteButton);
    $newRow.append($tdDeleteButton);

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

    $(".validation").remove();
    $nameEl.removeAttr('style');
    $courseEl.removeAttr('style');
    $gradeEl.removeAttr('style');
}

/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 */
function calculateAverage(){
    var gradeSum = null;

    for(var i = 0; i < student_array.length; i++){
        gradeSum += student_array[i].grade;
    }
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


