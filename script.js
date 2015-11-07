/**
 * Define all global variables here
 */
var student_array = [];
// variables to hold #studentName, #course, #studentGrade
var $nameEl = null;
var $courseEl = null;
var $gradeEl = null;
var idNum = 0; //indicate student array location

//Document ready
$(function(){
    //Listen for the document to load and reset the data to the initial state
    resetDOM();

    //Add clicked - Event Handler when user clicks the add button
    $(".btn-success").click(function(){
        var studentVal = $nameEl.val();
        var courseVal = $courseEl.val();
        var gradeVal= $gradeEl.val();
        var valid = formValidate(studentVal, courseVal, gradeVal);
        if(valid){
            addStudent(studentVal, courseVal, gradeVal);
        }
        //remove style created by failed ajax call
        $("#dataFail").remove();
    });

    //Cancel clicked - Event Handler when user clicks the cancel button, should clear out student form
    $(".btn-default").click(function(){
        //clear form
        clearAddStudentForm();
    });

    // Load clicked - Event Handler when user clicks the load data button,
    $(".btn-info").click(function(){
        //remove style created by failed ajax call
        $("#dataFail").remove();
        //request student data from LearningFuze SGT API
        $.ajax({
            dataType: "json",
            data: {api_key: "JhpapQQx34"},
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get",
            success: function(result) {
                var dataArr = result.data;
                if(result.success){
                    //add student data from server
                    for(var i = 0; i < dataArr.length; i++){
                        addStudent(dataArr[i].name, dataArr[i].course, dataArr[i].grade);
                    }
                    //turn off click, so data can not be loaded a second time
                    $(".btn-info").off("click").text("Data Loaded");
                }else{
                    //indicate failed attempt after button
                    $(".btn-info").after("<p>", {
                        id: "dataFail",
                        style:"color:red; font-weight: bold",
                        text: "Student Data Failed to Load"
                    })
                }
            } //end success function
        }); //end ajax call
    }); // end .btn-info click handler

    //assign values from DOM to variables
    $nameEl = $("#studentName");
    $courseEl = $("#course");
    $gradeEl = $("#studentGrade");

}); //END doc ready function

/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param name
 * @param course
 * @param grade
 */
function addStudent(name, course, grade) {
    //store grade as integer
    grade = parseInt(grade);

    //store input data in object
    var studentObject = {
        name: name,
        course: course,
        grade: grade,
        delete: function(){
            for(var i in student_array){
                if(student_array[i] === this){
                    student_array.splice(i, 1);
                    console.log(student_array);
                    calculateAverage();
                    return; //stop function when correct student is found
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
        class: 'btn btn-danger',
        text: 'Delete'
    }).click(function(){
        $(this).parents("tr").remove();
        studentObject.delete();
    });
    var $tdDeleteButton = $('<td>');

    $newRow.append($rowName);
    $newRow.append($rowCourse);
    $newRow.append($rowGrade);
    $tdDeleteButton.append($deleteButton);
    $newRow.append($tdDeleteButton);

    //ship row to DOM
    $('.student-list').append($newRow);

    //calculate & update grade average
    calculateAverage();

    //clear input form
    clearAddStudentForm();
}//end addStudent function

/**
 * Confirm all input fields are filled and correct formats are inputted
 * @param name
 * @param course
 * @param grade
 * @returns {boolean}
 */
function formValidate(name, course, grade){
    //clear any formatting from previous invalid form
    $(".validation").remove();
    $nameEl.removeAttr('style');
    $courseEl.removeAttr('style');
    $gradeEl.removeAttr('style');

    //Check if input is empty or incorrect value is entered
    if(name === "" || course === "" || grade === "" || isNaN(grade) || 0 > grade || grade > 100) {

        //if Student Grade is empty, NaN, outside of 1 - 100
        if (isNaN(grade) || grade === "" || grade < 1 || grade > 100) {
            //Insert text telling user to input grade
            $gradeEl.parent().after("<div style='color:red' class='validation'>Number From 1 - 100 Required</div>");
            $gradeEl.focus();
            //change border of required field
            $gradeEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
            $gradeEl.val("");
        }

        //if Student Course is empty
        if(course === ""){
            //Insert text telling user to input course
            $courseEl.parent().after("<div style='color:red' class='validation'>Student Course Required</div>");
            $courseEl.focus();
            //change border of required field
            $courseEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
            //clear the input field
            $("#course").val("");
        }

        //if Student Name is empty
        if(name === ""){
            //Insert text telling user to input name
            $nameEl.parent().after("<div style='color:red' class='validation'>Student Name Required</div>");
            $nameEl.focus();
            //change border of required field
            $nameEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
            //clear the input field
            $("#studentName").val("");
        }
        //input form is not valid
        return false;
    }
    //input form is valid
    return true;
}

/**
 * clearAddStudentForm - clears out the form values based on inputIds variable
 */
function clearAddStudentForm() {
    //clear form inputs
    $("#studentName").val("");
    $("#course").val("");
    $("#studentGrade").val("");

    //remove any styles added by errors/invalid entries
    $(".validation").remove();
    $nameEl.removeAttr('style');
    $courseEl.removeAttr('style');
    $gradeEl.removeAttr('style');
    $("#dataFail").remove();
}

/**
 * calculateAverage - loop through the global student array and calculate average grade and return that value
 */
function calculateAverage(){
    var gradeSum = null;
    //check for values in array
    if (student_array.length <= 0){
        //display grade Avg on screen
        $(".avgGrade").text("0");
        return;
    }

    //add up all student grades
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
function resetDOM(){
    student_array = [];
    $nameEl = null;
    $courseEl = null;
    $gradeEl = null;
    idNum = 0;
    $("tbody > tr").remove();
}




