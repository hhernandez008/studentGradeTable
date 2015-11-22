/**
 * Define all global variables here
 */
var studentArray = [];
//Arrays for Autocomplete
var studentNamesAuto = [];
var coursesAuto = [];
var filterAuto = [];
//API key for learningfuze database
var key = "JhpapQQx34";

// variables to hold #studentName, #course, #studentGrade
var $nameEl = null;
var $courseEl = null;
var $gradeEl = null;

//Document ready
$(document).ready(function(){
    //Listen for the document to load and reset the data to the initial state
    resetDOM();

    //Request student data from LearningFuze SGT API
    loadStudentAjaxCall();


    //Add clicked - Event Handler when user clicks the add button
    $(".btn-success").click(function(){
        $(".student-list-container").remove("p");
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
        $(".student-list-container").remove("p");
        //clear form
        clearAddStudentForm();
    });

    // Load clicked - Event Handler when user clicks the load student data button,
    $(".student-add-form .btn-primary").on("click",function(){
        //remove style created by failed ajax call
        $("#dataFail").remove();
        $(".student-list-container").remove("p");
        //TODO: turn off click handler until ajax call complete
        loadStudentAjaxCall();
    }); // end .btn-primary click handler

    //Sort student data
    $("th").on("click", function(){
        //only sort Headers with a sort attribute
        if($(this).attr("sort")) {
            sort(this);
            $(this).css("color", "#337ab7");
            $(this).siblings().removeAttr("style");
            $(this).siblings().children().removeAttr("style");
        }
    });

    //set the table to fixed layout so it does not expand cells
    $(".student-list").css("table-layout", "fixed");

    //remove delete button displayed errors
    $("body").on("click", function(){
        $("td").find("p").remove();
    });

    //assign values from DOM to variables
    $nameEl = $("#studentName");
    $courseEl = $("#course");
    $gradeEl = $("#studentGrade");

    //TODO: only show matching first letters
    //TODO: limit fields shown to 10 items
    //Auto-Complete Student Name & Course Field
    $($nameEl).autocomplete({
        source: function (request, response){
            //return source values that match input value from beginning
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response($.grep(studentNamesAuto, function(item){
                return matcher.test(item.label);
                })
            );
        },
        autoFocus: false,
        minLength: 2 //two letters needed before autocomplete menu shown
    });
    $($courseEl).autocomplete({
        source: function (request, response){
            //return source values that match input value from beginning
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response($.grep(coursesAuto, function(item){
                return matcher.test(item.label);
                })
            );
        },
        autoFocus: false,
        minLength: 2 //two letters needed before autocomplete menu shown
    });


    $("#filterInput").autocomplete({
        source: function(request, response){
            //return source values that match input value from beginning
            var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex(request.term), "i" );
            response( $.grep(filterAuto, function(item){
                return matcher.test(item.label);
            }) );
        },
        autoFocus: false,
        minLength: 1,
        select: function(event, ui){
            //insert the objects value into the input box, not its label
            $("#filterInput").val(ui.item.value);
            return false;
        }
    })
        .autocomplete( "instance" )._renderItem = function( ul, item ) {
        return $( "<li>" )
            .append( "<a>" + item.label + "<br>" + item.description + "</a>" )
            .appendTo( ul );
    };

    $("#filter").on("click", function(){
        console.log("filtered");
        //TODO: make filterDOM function to display the value entered in the #filterInput input
    });


}); //END doc ready function



/**
 * request student data from LearningFuze SGT API & add to DOM if successful
 */
function loadStudentAjaxCall(){
    //add loading image when student data is loading or reloading
    var $loading = $("<img>",{
        src: "images/loading.gif"
    });
    var $tcell = $("<td>", {
        colspan: "4",
        style: "text-align: center"
    }).append($loading);
    var $row = $("<tr>",{
        class: "loading"
    }).append($tcell);

    $("tbody").prepend($row);

    $.ajax({
        dataType: "json",
        data: {api_key: key},
        method: "post",
        url: "http://s-apis.learningfuze.com/sgt/get",
        success: function(result) {
            var dataArr = result.data;
            if(result.success){
                //clear DOM
                $(".loading").remove();
                $("tbody>tr").remove();
                //add student data from server
                for(var i = 0; i < dataArr.length; i++){
                    //remove any excess whitespace before storing & adding to DOM
                    dataArr[i].name = dataArr[i].name.trim();
                    dataArr[i].course = dataArr[i].course.trim();
                    addStudent(dataArr[i]);
                }
                highlightMinMaxStudent();

            }else{
                $(".loading").remove();
                var $errorMessage = $("<p>", {
                    id: 'dataFail',
                    style: 'color:red; font-weight: bold; font-size: 1.25em; text-align: center'
                }).text("Student Data Failed to Load | Please Try Again Later");
                //indicate failed attempt after buttons
                $(".student-list-container").prepend($errorMessage);

            }
        }, //end success function
        error: function(){
            $(".loading").remove();
            var $errorMessage = $("<p>", {
                id: 'dataFail',
                style: 'color:red; font-weight: bold; font-size: 1.25em; text-align: center'
            }).text("Student Data Failed to Load | Please Try Again Later");
            //indicate failed attempt after buttons
            $(".student-list-container").prepend($errorMessage);
        }
    }); //end ajax call
}

/**
 * ajax call to delete student from database & if successful delete from array and DOM
 * @param object
 * @param element
 */
function deleteStudentAjaxCall(object, element){
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
                        $(element).parents("tr").remove();
                        //calculate the new average
                        calculateAverage();
                        return studentArray; //stop function when correct student is found
                    }
                }
            }else{
                var $errorMessage = $("<p>", {
                    style: "color: #f0ad4e; font-weight: bold",
                    text:"You are not authorized to delete this student."
                });
                $(element).after($errorMessage);
            }
        }, //end success function
        error: function(){
            var $errorMessage = $("<p>", {
                style: "color: #f0ad4e; font-weight: bold",
                text: "Unable to delete this student from server. Try again later"
            });
            $(element).after($errorMessage);
        }
    }); //end ajax call
}

/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 * @param object
 */
function addStudent(object) {
    //store grade as integer
    object.grade = parseInt(object.grade);
    //Does the student already have an ID? It was passed in from database. Don't pass back.
    if(object.hasOwnProperty("id")){
        object.delete = function (element) {
            deleteStudentAjaxCall(object, element);
        };
        //place object in studentArray
        studentArray.push(object);

        //add student to the DOM
        addStudentToDOM(object);

        //calculate & update grade average
        calculateAverage();

        //highlight the students with top and low grades
        highlightMinMaxStudent();

        //clear input form
        clearAddStudentForm();
    }else {
        //remove any excess whitespace before storing & adding to DOM
        object.name = object.name.trim();
        object.course = object.course.trim();
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
                    object.delete = function (element) {
                        deleteStudentAjaxCall(object, element);
                    };
                    //place object in studentArray
                    studentArray.push(object);

                    //add student to the DOM
                    addStudentToDOM(object);

                    //calculate & update grade average
                    calculateAverage();

                    //highlight the students with top and low grades
                    highlightMinMaxStudent();

                    //clear input form
                    clearAddStudentForm();

                }else{
                    var $errorMessage = $("<p>", {
                        id: 'dataFail',
                        style: 'color:red; font-weight: bold'
                    }).text("Failed to Add Student | Please Try Again");
                    //indicate failed attempt after buttons
                    $(".student-add-form").append($errorMessage);
                }
            }, //end success function
            error: function(){
                var $errorMessage = $("<p>",{
                    id: 'dataFail',
                    style: 'color:red; font-weight: bold'
                    }).text("Failed to Add Student | Please Try Again");
                //indicate failed attempt after buttons
                $(".student-add-form").append($errorMessage);
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
        object.delete(this);
    });
    var $tdDeleteButton = $('<td>');

    $newRow.append($rowName);
    $newRow.append($rowCourse);
    $newRow.append($rowGrade);
    $tdDeleteButton.append($deleteButton);
    $newRow.append($tdDeleteButton);

    //ship row to DOM
    $('.student-list').prepend($newRow);

    var filterObject = {};

    //add the student name and course to the autocomplete arrays
    if(studentNamesAuto.indexOf(object.name.value) == -1){
        studentNamesAuto.push({
            value: object.name,
            label: object.name.toUpperCase()
        });
        filterObject = {
            value: "Student Name: " + object.name,
            label: object.name.toUpperCase(),
            description: "Student Name"
        };
        filterAuto.push(filterObject);
    }
    if(coursesAuto.indexOf(object.course.value) == -1){
        coursesAuto.push({
            value: object.course,
            label: object.course.toUpperCase()
        });
        filterObject = {
            value: "Student Course: " + object.course,
            label: object.course.toUpperCase(),
            description: "Student Course"
        };
        filterAuto.push(filterObject);
    }

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
    if(object.name.length < 2 || object.course.length < 2 || object.grade === "" || isNaN(object.grade) || 0 > object.grade || object.grade > 100) {

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
        }else if(object.course.length < 2){
            //Insert text telling user to input course with 2+ characters
            $courseEl.parent().after("<div style='color:red' class='validation'>Course must be at least two characters long.</div>");
            $courseEl.focus();
            //change border of required field
            $courseEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
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
        }else if(object.name.length < 2){
            //Insert text telling user to input name
            $nameEl.parent().after("<div style='color:red' class='validation'>Student Name must be at least two characters long.</div>");
            $nameEl.focus();
            //change border of required field
            $nameEl.css({
                'border-color': 'red',
                'box-shadow': 'none'
            });
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
 * Iterate through the studentArray and find the students with the maximum and minimum grades
 * Highlight the students in the DOM
 */
function highlightMinMaxStudent(){
    //remove previous highlighting
    $("tr").removeAttr("style");
    //Set the min & max to the grade value of the first index in array
    var min = studentArray[0].grade;
    var max = studentArray[0].grade;
    //iterate through array and find the min & max grade value
    for(var i = 1; i < studentArray.length; i++){
        if(studentArray[i].grade > max){
            max = studentArray[i].grade;
        }
        if(studentArray[i].grade < min){
            min = studentArray[i].grade;
        }
    }

    //highlight the rows with a grade that matches the min or max
    //grades stored in the 3rd column
    var gradeCells = $("td:nth-child(3)");
    for(var j = 0; j < gradeCells.length; j++){
        //check the value of each grade cell
        var $currentCell = $(gradeCells)[j];
        var gradeValue = $($currentCell).text();
        if(gradeValue == max){
            $($currentCell).parent().css("background-color", "#b3ffb3"); //green
        } else if (gradeValue == min) {
            $($currentCell).parent().css("background-color", "#ffd9b3"); //orange
        }
    }
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
    var $firstChild = $(self).find("span").first();
    var firstChildStyle = $($firstChild).attr("style");

    //if there is a empty style attr for both arrow icons set attr so the column will be sorted in ascending order
    if(firstChildStyle == ""){
        if($($firstChild).next().attr("style") == ""){
            $($firstChild).next().css("display", "inline-block");
            $($firstChild).css("display", "none");
            //assign new style value to firstChildStyle
            firstChildStyle = "display: none;";
        }
    }

    //triangle-top(up) for ascending (first icon/span)
    //triangle-bottom(down) for descending (second icon/span)

    if(typeof(firstChildStyle) == "undefined") {
        //up arrow to display
        $($firstChild).css("display", "inline-block");
        $($firstChild).next().toggle();
        ascendingSort(sortField);
        console.log("undefined");
    }else if(firstChildStyle == "display: none;") {
        //up arrow to display
        $($firstChild).toggle();
        $($firstChild).next().toggle();
        ascendingSort(sortField);
        console.log("none");
    } else {
        //down arrow to display
        $($firstChild).toggle();
        $($firstChild).next().toggle();
        descendingSort(sortField);
        console.log("else");
    }
}

/**
 * Sort array by field param in descending order.
 * @param field
 */
function descendingSort(field){
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
    $("tbody>tr").remove();
    for(var i = 0; i < sortedArray.length; i++){
        addStudentToDOM(sortedArray[i]);
    }

    //highlight the students with top and low grades
    highlightMinMaxStudent();
}

/**
 * Sort array by field param in ascending order.
 * @param field
 */
function ascendingSort(field){
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
    $("tbody>tr").remove();
    for(var i = 0; i < sortedArray.length; i++){
        addStudentToDOM(sortedArray[i]);
    }
    //highlight the students with top and low grades
    highlightMinMaxStudent();
}

/**
 * reset - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */
function resetDOM(){
    studentArray = [];
    $nameEl = null;
    $courseEl = null;
    $gradeEl = null;
    $("tbody>tr").remove();
}