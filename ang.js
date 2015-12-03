var sgtApp = angular.module("sgtApp", []);

sgtApp.config(['$httpProvider', function ($httpProvider) {
    //Set headers content-type to x-www-form-urlencoded
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}]);

sgtApp.factory("studentService", function($http){
    var student = {};
    student.studentArray = [];
    var apiKey = "JhpapQQx34";

    student.dataObjToString = function(obj){
        obj = $.param(obj);
        return obj;
    };
    student.studentDataCall = function(){
        return $http({
            data: "api_key=" + apiKey,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get"
        });
    };
    student.studentAddCall = function(obj){
        var data = "api_key=" + apiKey + "&" + student.dataObjToString(obj);
        console.log("studentAddCall data: ", data);
        return $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create"
        });
    };
    return student;
});

sgtApp.controller("appController", function($scope, studentService){
    var self = this;
    self.loadError = false;
    self.loading = false;

    self.reloadStudents = function(){
        self.loadError = false;
        self.loadStudentsData();
    };

    self.calculateAverage = function(){
        var gradeQuantity = studentService.studentArray.length;
        var gradeSum = null;
        for(var i = 0; i < gradeQuantity; i++){
            gradeSum += studentService.studentArray[i].grade;
        }
        //return grade average
        return Math.round(gradeSum/gradeQuantity);
    };

    self.loadStudentsData = function(){
        //show loading gif
        self.loading = true;
        studentService.studentDataCall()
            .then(function(result){
                //remove loading gif
                self.loading = false;
                var dataArr = result.data.data;
                if(result.data.success){
                    //empty array before loading data
                    studentService.studentArray = [];
                    //add student data from server
                    for(var i = 0; i < dataArr.length; i++){
                        //remove any excess whitespace before storing & adding to DOM
                        dataArr[i].name = dataArr[i].name.trim();
                        dataArr[i].course = dataArr[i].course.trim();
                        dataArr[i].deleteError = false;
                        //add student to array; object properties: id(num), name(string), grade(num), course(string)
                        studentService.studentArray.unshift(dataArr[i]);
                    }
                }else {
                    //show error message
                    self.loadError = true;
                }
                console.log(studentService.studentArray);
                //run apply of $scope service
                //$scope.$apply();
            },
            function(response){
                self.loading = false;
                console.error("error");
            }
        );
    }; //end loadStudentsData

    //load student data on controller load
    self.loadStudentsData();
}); //end appController

sgtApp.controller("formController", function($scope, studentService){
    //Handles inputs & validation thru angular
    //add new student to array after successful ajax call, error handling
    var self = this;
    self.newStudent = {};
    self.addStudentError = false;

    self.addStudent = function(){
        self.addStudentError = false;
        //verify valid inputs
        //insert newStudent at the start of the array
        self.addStudentAjaxCall();
    };

    self.addStudentAjaxCall = function() {
        studentService.studentAddCall(self.newStudent)
            .then(function (response) {
                if (response.success) {
                    console.log("Student Added: ", self.newStudent);
                    self.newStudent.id = response.new_id;
                    self.newStudent.deleteError = false;
                    //place object in studentArray
                    studentService.studentArray.unshift(self.newStudent);

                    //clear input form
                    self.newStudent = {};
                } else {
                    self.addStudentError = true;
                }
                // $scope.$digest() cleared the newStudent object, but did not call the ng-repeat on the studentArray
                $scope.$apply();
            }, //end success function
            function () {
                self.addStudentError = true;
                $scope.$apply();
            }
        );

    };
});

sgtApp.controller("studentListController", function($scope, studentService){

    this.deleteStudent = function(index){
        //ajax call to delete student on success delete student
        var studentID = studentService.studentArray[index].id;
        this.deleteStudentAjaxCall(studentID, index);
    };

    this.deleteStudentAjaxCall = function(id, index){
        $.ajax({
            dataType: "json",
            data: {api_key: $scope.key, student_id: id},
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/delete",
            success: function(result) {
                if(result.success) {
                    studentService.studentArray.splice(index, 1);
                }else{
                    studentService.studentArray[index].deleteError = true;
                    studentService.studentArray[index].deleteErrorMessage = "You are not authorized to delete this student.";
                }
                $scope.$apply();
            }, //end success function
            error: function(){
                studentService.studentArray[index].deleteError = true;
                studentService.studentArray[index].deleteErrorMessage = "You are not authorized to delete this student.";
                $scope.$apply();
            }
        }); //end ajax call
    };

    //highlight min & max students
});
