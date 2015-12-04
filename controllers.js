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
        grade: ""
    };
    this.nameError = false;
    this.courseError = false;
    this.gradeError = false;
    this.addStudentError = studentDataService.addingError;
    //add student to database & update studentDataService.studentArray
    this.addStudent = function () {
        console.log("student name", this.newStudent.name);
        var nameBool = validationService.lettersOnly(this.newStudent.name);
        console.log("student course", this.newStudent.course);
        var courseBool = validationService.lettersAndNumbersOnly(this.newStudent.course);
        console.log("student grade", this.newStudent.grade);
        var gradeBool = validationService.numBetween(this.newStudent.grade, 0, 100);
        if(nameBool && courseBool && gradeBool){
            //all inputs validate to true
            studentDataService.resetErrors();
            console.log("before add call ", this.newStudent);
            studentDataService.studentAddCall(this.newStudent);
            //this.newStudent = {};
        }else{
            if(!nameBool){
                console.log("name error");
                this.nameError = true;
            }
            if(!courseBool){
                console.log("course error");
                this.courseError = true;
            }
            if(!gradeBool){
                console.log("grade error");
                this.gradeError = true;
            }
        }

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