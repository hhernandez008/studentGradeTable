var sgtApp = angular.module("sgtApp");

sgtApp.controller("appController", function (studentDataService) {
    //make initial call to retrieve student data
    studentDataService.studentDataCall();
    //reload button clicked
    this.reloadStudents = function () {
        studentDataService.resetErrors();
        studentDataService.studentDataCall();
    };

    this.resetErrors = studentDataService.resetErrors;

    //calculate average
    this.calculateAverage = function () {
        var gradeSum = 0;
        var numGrades = 0;
        for (var i = 0; i < studentDataService.studentArray.length; i++) {
            gradeSum += studentDataService.studentArray[i].grade;
            numGrades++;
        }
        return Math.round(gradeSum / numGrades);
    };
}).controller("formController", function (studentDataService) {
    this.newStudent = {};
    this.addStudentError = studentDataService.addingError;
    //add student to database & update studentDataService.studentArray
    this.addStudent = function () {
        studentDataService.resetErrors();
        studentDataService.studentAddCall(this.newStudent);
        this.newStudent = {};
    };
    this.resetForm = function () {
        studentDataService.resetErrors();
        this.newStudent = {};
    }
}).controller("studentList", function (studentDataService) {
    this.loadError = studentDataService.loadingError;
    //copy of the studentDataService.studentDataCall
    this.studentData = studentDataService.loadingResults;

    this.deleteError = studentDataService.deletingError;
    this.errorMessage = studentDataService.deletingErrorMessage;
    this.deleteStudent = function (num) {
        studentDataService.resetErrors();
        var studentID = studentDataService.studentArray[num].id;
        studentDataService.studentDeleteCall(studentID, num);
    };
});