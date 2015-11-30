var sgtApp = angular.module("sgtApp", []);

sgtApp.factory("studentService", function($http){
    //API key for learningfuze database
    var apiKey = "JhpapQQx34";

    var ajaxCall = function(dataObject, action){
        $http({
            data: dataObject,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/" + action
        })
    };

    return {
        ajaxCall: ajaxCall(dataObject, action)
    };
});

sgtApp.controller("appController", function($scope, studentService){
    //Handles Student Loading from API

    //adding students to dom
    $scope.studentArray = [
        //DUMMY DATA
        {name: "Heather", course: "Math", grade: 98},
        {name: "Andrew", course: "Math", grade: 100},
        {name: "Nick", course: "Math", grade: 89},
        {name: "Tanner", course: "Math", grade: 74}
    ];

    this.calculateAverage = function(){
        var gradeQuantity = $scope.studentArray.length;
        var gradeSum = null;
        for(var i = 0; i < gradeQuantity; i++){
            gradeSum += $scope.studentArray[i].grade;
        }
        //return grade average
        return Math.round(gradeSum/gradeQuantity);
    };
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
