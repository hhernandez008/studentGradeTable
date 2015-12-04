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
}).controller("formController", function (studentDataService, validationService) {
    this.newStudent = {
        name: "",
        course: "",
        grade: null
    };

    //add student to database & update studentDataService.studentArray
    this.addStudent = function () {
        //if there is an error will return true
        this.nameError = validationService.lettersOnly(this.newStudent.name);
        this.courseError = validationService.lettersAndNumbersOnly(this.newStudent.course);
        this.gradeError = validationService.numBetween(this.newStudent.grade, 0, 100);

        //if each pass validation test will return false
        if(!this.nameError && !this.courseError && !this.gradeError){
            //all inputs validate to true
            studentDataService.resetErrors();
            studentDataService.studentAddCall(this.newStudent);
            //reset newStudent
            this.newStudent = {
                name: "",
                course: "",
                grade: null
            };
        }
    };
    this.resetForm = function () {
        studentDataService.resetErrors();
        this.newStudent = {
            name: "",
            course: "",
            grade: null
        };
        this.nameError = false;
        this.courseError = false;
        this.gradeError = false;
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