var sgtApp = angular.module("sgtApp", []);

sgtApp.controller("appController", function($scope, studentService){
    this.key = "JhpapQQx34";
    $scope.studentArray = [];

    this.reloadStudents = function(){
        this.loadStudentsAjax();
    };

    this.calculateAverage = function(){
        var gradeQuantity = $scope.studentArray.length;
        var gradeSum = null;
        for(var i = 0; i < gradeQuantity; i++){
            gradeSum += $scope.studentArray[i].grade;
        }
        //return grade average
        return Math.round(gradeSum/gradeQuantity);
    };

    this.loadStudentsAjax = function(){
        /*//add loading image when student data is loading or reloading
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
        $("tbody").prepend($row);*/

        //ajax call to load students
        $.ajax({
            dataType: "json",
            data: {api_key: this.key},
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
});

sgtApp.controller("formController", function($scope, studentService){
    //Handles inputs & validation thru angular
    //add new student to array after successful ajax call, error handling
    this.newStudent = {};

    this.addStudent = function(){
        //verify valid inputs
        //insert newStudent at the start of the array
        $scope.studentArray.unshift(this.newStudent);
        this.newStudent = {};
    };

    //auto-complete for name & course
});

sgtApp.controller("studentListController", function($scope, studentService){
    //handle student delete & errors
    this.deleteStudent = function(num){
        //ajax call to delete student on success delete student
        $scope.studentArray.splice(num, 1);
    };

    //highlight min & max students
});
