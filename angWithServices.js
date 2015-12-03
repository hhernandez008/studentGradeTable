var sgtApp = angular.module("sgtApp", []);

sgtApp.config(['$httpProvider', function ($httpProvider) {
    //Set headers content-type to x-www-form-urlencoded
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}]);

sgtApp.service("studentDataService", function ($http, $log) {
    var student = this;
    var apiKey = "JhpapQQx34";
    //Collect student data retrieved from database
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

    /**
     * LOADING STUDENT DATA
     */

    student.loadError = false;
    /**
     * initial load and reload of student data
     * @returns {*}
     */
    student.studentDataCall = function () {
        $http({
            data: "api_key=" + apiKey,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get"
        }).then(function (result) {
            if (result.data.success) {
                //save student data in reversed order
                student.studentArray = result.data.data.reverse();
            } else {
                student.loadError = true;
                $log.error(result.data.error[0]);
            }
        }, function () {
            $log.error("Unsuccessful call to http://s-apis.learingfuze.com/sgt/get");
            student.loadError = true;
        });
    };
    //return the student array
    student.loadingResults = function () {
        return student.studentArray;
    };
    //return a load error indication
    student.loadingError = function () {
        return student.loadError;
    };

    /**
     * ADDING STUDENTS
     */

    student.addError = false;
    /**
     * Send the newly created student object to the database & on success add the student and
     * the returned id to the student array
     * @param obj
     */
    student.studentAddCall = function (obj) {
        var data = "api_key=" + apiKey + "&" + student.dataObjToString(obj);
        $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create"
        }).then(function (result) {
            if (result.data.success) {
                obj.id = result.data.new_id;
                //add student to the start of the array
                student.studentArray.unshift(obj);
            } else {
                student.addError = true;
                $log.error(result.data.errors[0]);
            }
        }, function () {
            $log.error("Unsuccessful call to http://s-apis.learningfuze.com/sgt/create");
            student.addError = true;
        });
    };
    //return add student error indicator
    student.addingError = function () {
        return student.addError;
    };


    /**
     * DELETING STUDENTS
     */

    student.delteError = false;
    student.deleteErrorMessage = "";
    /**
     * Send the id of the student to delete to the database.
     * On success delete the student form the student array.
     * @param studentId
     * @param index
     */
    student.studentDeleteCall = function (studentId, index) {
        var data = "api_key=" + apiKey + "&student_id=" + studentId;
        $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/delete"
        }).then(function (result) {
            if (result.data.success) {
                student.studentArray.splice(index, 1);
            } else {
                student.deleteError = true;
                student.deleteErrorMessage = "You are not authorized to delete this student";
                $log.error(result.data.errors[0]);
            }
        }, function () {
            student.deleteError = false;
            student.deleteErrorMessage = "Unable to delete student at this time. Please try again.";
            $log.error("Unsuccessful call to http://s-apis.learninfuze.com/sgt/create");
        });
    };
    //return delete student error indicators
    student.deletingError = function () {
        return student.deleteError;
    };
    //return delete student error message
    student.deletingErrorMessage = function(){
        return student.deleteErrorMessage;
    };

    /**
     * Reset all errors to original value
     */
    student.resetErrors = function () {
        student.loadError = false;
        student.addError = false;
        student.deleteError = false;
        student.deleteErrorMessage = "";
    };
}); //end studentDataService


sgtApp.controller("appController", function (studentDataService) {
    //make initial call to retrieve student data
    studentDataService.studentDataCall();
    //reload button clicked
    this.reloadStudents = function () {
        studentDataService.resetErrors();
        studentDataService.studentDataCall();
    };

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