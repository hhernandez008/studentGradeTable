var app = angular.module("sgtApp", []);

app.controller("appController", function($scope){
    //Handles Student Loading from API

    this.calculateAverage = function(){
        var gradeQuantity = $scope.studentArray.length;
        var gradeSum = null;
        for(var i = 0; i < gradeQuantity; i++){
            gradeSum += $scope.studentArray[i].grade;
        }
        //return grade average
        return Math.round(gradeSum/gradeQuantity);
    }
});

app.controller("formController", function($scope){
    //Handles inputs & validation thru angular
    //add new student to array after successful ajax call, error handling
    this.student = {};

    this.addStudent = function(){
        //verify valid inputs
        this.student.grade = parseInt(this.student.grade);
        $scope.studentArray.push(this.student);
    }
});

app.controller("studentListController", function($scope){
    //adding students to dom
    $scope.studentArray = [
        //DUMMY DATA
        {name: "Heather", course: "Math", grade: 98},
        {name: "David", course: "Math", grade: 100},
        {name: "Chris", course: "Math", grade: 89},
        {name: "Tanner", course: "Math", grade: 74}
    ];

    //handle student delete & errors
    this.deleteStudent = function(num){
        //ajax call to delete student on success delete student
        $scope.studentArray.splice(num, 1);
    }
});