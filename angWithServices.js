var sgtApp = angular.module("sgtApp", []);

sgtApp.config(['$httpProvider', function ($httpProvider) {
    //Set headers content-type to x-www-form-urlencoded
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}]);

sgtApp.factory("studentDataService", function ($http, $log, $q) {
    var student = {};
    var apiKey = "JhpapQQx34";
    student.studentArray = [];

    /**
     * Take the passed in obj and convert it to a parameter string for use in url/param string creation.
     * @param obj
     * @returns {*}
     */
    student.dataObjToString = function (obj) {
        obj = $.param(obj);
        return obj;
    };

    //save the student data returned by the $http service
    student.loadData = [];
    student.loadError = false;
    /**
     * initial load of student data and reload of data
     * @returns {*}
     */
    student.studentDataCall = function () {
        $http({
            data: "api_key=" + apiKey,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get"
        }).then(function (result) {
            if(result.data.success) {
                student.studentArray = result.data.data;
            }else{
                student.loadError = true;
                $log.error(result.data.error[0]);
            }
        }, function (){
            $log.error("Unsuccessful call to http://s-apis.learingfuze.com/sgt/get");
            student.loadError = true;
        });
    };
    student.loadingResults = function () {
        return student.studentArray;
    };
    student.loadingError = function(){
        return student.loadError;
    };

    student.addError = false;

    student.studentAddCall = function (obj) {
        var data = "api_key=" + apiKey + "&" + student.dataObjToString(obj);
        $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create"
        }).then(function(result){
            if(result.data.success){
                obj.id = result.data.new_id;
                student.studentArray.unshift(obj);
            }else{
                student.addError = true;
                $log.error(result.data.errors[0]);
            }
        }, function(){
            $log.error("Unsuccessful call to http://s-apis.learningfuze.com/sgt/create");
            student.addError = true;
        });
    };
    student.addingError = function(){
        return student.addError;
    };

    student.resetErrors = function(){
        student.loadError = false;
        student.addError = false;
    };
    return student;
});

sgtApp.controller("appController", function (studentDataService) {
    //make initial call to retrieve student data
    studentDataService.studentDataCall();
    //reload button clicked
    this.reloadStudents = function () {
        studentDataService.resetErrors();
        studentDataService.studentDataCall();
    };

    //calculate average
    this.calculateAverage = function(){
        var gradeSum = 0;
        var numGrades = 0;
        for(var i = 0; i < studentDataService.studentArray.length; i++){
            gradeSum += studentDataService.studentArray[i].grade;
            numGrades++;
        }
        return Math.round(gradeSum/numGrades);
    };
});

sgtApp.controller("formController", function (studentDataService) {
    this.newStudent = {};
    this.addStudentError = studentDataService.addingError;
    //add student to database & update studentDataService.studentArray
    this.addStudent = function () {
        studentDataService.resetErrors();
        studentDataService.studentAddCall(this.newStudent);
    };
    this.resetForm = function(){
        studentDataService.resetErrors();
        this.newStudent = {};
    }
});

sgtApp.controller("studentList", function (studentDataService) {
    this.loadError = studentDataService.loadingError;
    //copy of the studentDataService.studentDataCall
    this.studentData = studentDataService.loadingResults;

    this.deleteStudent = function () {

    };
});