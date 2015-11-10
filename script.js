/**
 * Define all global variables here
 */
var studentArray = [];
var key = "JhpapQQx34";
// variables to hold #studentName, #course, #studentGrade
var $nameEl = null;
var $courseEl = null;
var $gradeEl = null;

//Document ready
$(function(){
    //Listen for the document to load and reset the data to the initial state
    resetDOM();

    //Request student data from LearningFuze SGT API
    $.ajax({
        dataType: "json",
        data: {api_key: key},
        method: "post",
        url: "http://s-apis.learningfuze.com/sgt/get",
        success: function(result) {
            var dataArr = result.data;
            if(result.success){
                $("tbody > tr").remove();
                //add student data from server
                for(var i = 0; i < dataArr.length; i++){
                    addStudent(dataArr[i]);
                }
            }else{
                //indicate failed attempt/false result.success

            }
        } //end success function
    }); //end ajax call

    //Add clicked - Event Handler when user clicks the add button
    $(".btn-success").click(function(){
        var student = {
            name: $nameEl.val(),
            course: $courseEl.val(),
            grade: $gradeEl.val()
        };
        var valid = formValidate(student);
        if(valid){
            addStudent(student);
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
            data: {api_key: key},
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get",
            success: function(result) {
                var dataArr = result.data;
                if(result.success){
                    //clear DOM
                    $("tbody > tr").remove();
                    //add student data from server
                    for(var i = 0; i < dataArr.length; i++){
                        addStudent(dataArr[i]);
                    }
                }else{
                    //indicate failed attempt after button
                    $(".btn-info").after("<p>", {
                        id: "dataFail",
                        style:"color:red; font-weight: bold",
                        text: "Student Data Failed to Reload"
                    })
                }
            } //end success function
        }); //end ajax call
    }); // end .btn-info click handler

    //Sort student data
    $("th").on("click", function(){
        //only sort Headers with a sort attribute
        if($(this).attr("sort")) {
            $(this).siblings().children().remove("span");
            sort(this);
        }
    });

    //assign values from DOM to variables
    $nameEl = $("#studentName");
    $courseEl = $("#course");
    $gradeEl = $("#studentGrade");


}); //END doc ready function

/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param object
 */
function addStudent(object) {
    //store grade as integer
    object.grade = parseInt(object.grade);
    //Does the student already have an ID? It was passed in from database. Don't pass back.
    if(object.hasOwnProperty("id")){
        object.delete = function () {
            $.ajax({
                dataType: "json",
                data: {api_key: key, student_id: object.id},
                method: "post",
                url: "http://s-apis.learningfuze.com/sgt/delete",
                success: function(result) {
                    if(result.success) {
                        for (var i in studentArray) {
                             if (studentArray[i].id === object.id) {
                                 studentArray.splice(i, 1);
                                 //calculate the new average
                                 calculateAverage();
                                 return studentArray; //stop function when correct student is found
                             }
                        }
                    }else{
                        //TODO show failed delete attempt.
                    }


                } //end success function
            }); //end ajax call
        };
        //place object in studentArray
        studentArray.push(object);

        //add student to the DOM
        addStudentToDOM(object);

        //calculate & update grade average
        calculateAverage();

        //clear input form
        clearAddStudentForm();
    }else {
        //send the student to the database
        $.ajax({
            dataType: "json",
            data: {
                api_key: key,
                name: object.name,
                course: object.course,
                grade: object.grade
            },
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create",
            //add id & delete method to object
            success: function (response) {
                if (response.success){
                    object.id = response.new_id;
                    object.delete = function () {
                        $.ajax({
                            dataType: "json",
                            data: {api_key: key, student_id: object.id},
                            method: "post",
                            url: "http://s-apis.learningfuze.com/sgt/delete",
                            success: function(result) {
                                if(result.success) {
                                    for (var i in studentArray) {
                                        if (studentArray[i].id === object.id) {
                                            studentArray.splice(i, 1);
                                            //calculate the new average
                                            calculateAverage();
                                            return studentArray; //stop function when correct student is found
                                        }
                                    }
                                }else{
                                    //TODO show failed delete attempt.
                                }
                            } //end success function
                        }); //end ajax call
                    };
                    //place object in studentArray
                    studentArray.push(object);

                    //add student to the DOM
                    addStudentToDOM(object);

                    //calculate & update grade average
                    calculateAverage();

                    //clear input form
                    clearAddStudentForm();
                    console.log(object);
                }else{
                    //display response.error
                }
            }
        });
    }


}

/**
 * Take in the object and with properties of name, course, grade & a delete method.
 * Print the object to the DOM
 * @param object
 */
function addStudentToDOM(object){
    //add object to HTML table in DOM
    var $newRow = $('<tr>');
    var $rowName = $('<td>').text(object.name);
    var $rowCourse = $('<td>').text(object.course);
    var $rowGrade = $('<td>').text(object.grade);
    var $deleteButton = $('<button>', {
        class: 'btn btn-danger',
        text: 'Delete'
    }).click(function(){
        $(this).parents("tr").remove();
        object.delete();
    });
    var $tdDeleteButton = $('<td>');

    $newRow.append($rowName);
    $newRow.append($rowCourse);
    $newRow.append($rowGrade);
    $tdDeleteButton.append($deleteButton);
    $newRow.append($tdDeleteButton);

    //ship row to DOM
    $('.student-list').append($newRow);
}

/**
 * Confirm all input fields are filled and correct formats are inputted
 * @param object
 * @returns {boolean}
 */
function formValidate(object){
    //clear any formatting from previous invalid form
    $(".validation").remove();
    $nameEl.removeAttr('style');
    $courseEl.removeAttr('style');
    $gradeEl.removeAttr('style');

    //Check if input is empty or incorrect value is entered
    if(object.name === "" || object.course === "" || object.grade === "" || isNaN(object.grade) || 0 > object.grade || object.grade > 100) {

        //if Student Grade is empty, NaN, outside of 1 - 100
        if (isNaN(object.grade) || object.grade === "" || object.grade < 1 || object.grade > 100) {
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
        if(object.course === ""){
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
        if(object.name === ""){
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
    if (studentArray.length <= 0){
        //display grade Avg on screen
        $(".avgGrade").text("0");
        return;
    }

    //add up all student grades
    for(var i = 0; i < studentArray.length; i++){
        gradeSum += studentArray[i].grade;
    }
    //calculate average
    var gradeAvg = Math.round(gradeSum/studentArray.length);

    //display grade Avg on screen
    $(".avgGrade").text(gradeAvg);
}

/**
 * Sort list by element param.
 * Add a icon to indicate that the list is sorted by that element & weather it is in ascending or descending order.
 * Call ascendingSort or descendingSort to sort list in the correct order.
 * @param element
 */
function sort(element){
    var self = element;
    //sort array by element sort attribute
    var sortField = $(self).attr('sort');

    //Does the element have a span child?
    if($(self).children().is("span")){
        if($(self).children("span").hasClass("glyphicon-triangle-bottom")){
            //sort in descending order
            $(self).children("span").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
            descendingSort(sortField);
        }else{
            //sort in ascending order
            $(self).children("span").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
            ascendingSort(sortField);
        }
    }else {
        //sort in ascending order as default
        $(self).append("<span class='glyphicon glyphicon-triangle-bottom'></span>");
        ascendingSort(sortField);
    }
}

/**
 * Sort array by field param in ascending order.
 * @param field
 */
function ascendingSort(field){
    //make a copy of the studentArray to sort
    var sortedArray = studentArray.slice(0);
    switch (field){
        case "name":
            sortedArray.sort(function(a, b){
                var propertyA = a.name.toLowerCase();
                var propertyB = b.name.toLowerCase();
                //sort string ascending
                if (propertyA < propertyB) {
                    return -1;
                }else if (propertyA > propertyB) {
                    return 1;
                }else {
                    //default return value (no sorting)
                    return 0;
                }
            });
            break;
        case "course":
            sortedArray.sort(function(a, b){
                var propertyA = a.course.toLowerCase();
                var propertyB = b.course.toLowerCase();
                //sort string ascending
                if (propertyA < propertyB) {
                    return -1;
                }else if (propertyA > propertyB) {
                    return 1;
                }else {
                    //default return value (no sorting)
                    return 0;
                }
            });
            break;
        case "grade":
            sortedArray.sort(function(a, b){
                var propertyA= parseFloat(a.grade);
                var propertyB=parseFloat(b.grade);
                //sort string ascending
                if (propertyA < propertyB) {
                    return -1;
                }else if (propertyA > propertyB) {
                    return 1;
                }else {
                    //default return value (no sorting)
                    return 0;
                }
            });
            break;
        default:
            console.log("Sort field " + field + " not found.");
    }
    //clear DOM & repopulate student list
    $("tbody > tr").remove();
    for(var i = 0; i < sortedArray.length; i++){
        addStudentToDOM(sortedArray[i]);
    }
}

/**
 * Sort array by field param in descending order.
 * @param field
 */
function descendingSort(field){
    //make copy of studentArray to sort
    var sortedArray = studentArray.slice(0);
    switch (field){
        case "name":
            sortedArray.sort(function(a, b){
                var propertyA = a.name.toLowerCase();
                var propertyB = b.name.toLowerCase();
                //sort string descending
                if (propertyA > propertyB) {
                    return -1;
                }else if (propertyA < propertyB) {
                    return 1;
                }else {
                    //default return value (no sorting)
                    return 0;
                }
            });
            break;
        case "course":
            sortedArray.sort(function(a, b){
                var propertyA = a.course;
                var propertyB = b.course;
                //sort string descending
                if (propertyA > propertyB) {
                    return -1;
                }else if (propertyA < propertyB) {
                    return 1;
                }else {
                    //default return value (no sorting)
                    return 0;
                }
            });
            break;
        case "grade":
            sortedArray.sort(function(a, b){
                var propertyA= parseFloat(a.grade);
                var propertyB=parseFloat(b.grade);
                //sort string descending
                if (propertyA > propertyB) {
                    return -1;
                }else if (propertyA < propertyB) {
                    return 1;
                }else {
                    //default return value (no sorting)
                    return 0;
                }
            });
            break;
        default:
            console.log("Sort field " + field + " not found.");
    }
    //clear DOM & populate sorted student list
    $("tbody > tr").remove();
    for(var i = 0; i < sortedArray.length; i++){
        addStudentToDOM(sortedArray[i]);
    }
}

/**
 * reset - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */
function resetDOM(){
    studentArray = [];
    $nameEl = null;
    $courseEl = null;
    $gradeEl = null;
    $("tbody > tr").remove();
}