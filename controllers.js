var sgtApp = angular.module("sgtApp");

sgtApp.controller("appController", function (studentDataManipulation, studentDataInformation) {
    var aCtrl = this;
    aCtrl.resetErrors = studentDataManipulation.resetErrors;
    //calculate average
    aCtrl.calculateAverage = studentDataInformation.calculateAverageGrade;

    aCtrl.minGrade = null;
    aCtrl.maxGrade = null;
    aCtrl.minMaxGrades = function(){
        var valObj = studentDataInformation.highLowValues('grade');
        aCtrl.minGrade = valObj.low;
        aCtrl.maxGrade = valObj.high;
    };
}).controller("formController", function (studentDataManipulation, validationService) {
    var fCtrl = this;
    fCtrl.newStudent = {
        name: "",
        course: "",
        grade: null
    };
    //add student to database & update studentDataManipulation.studentArray
    fCtrl.addStudent = function () {
        //if there is an error will return true
        fCtrl.nameError = validationService.lettersOnly(fCtrl.newStudent.name);
        fCtrl.courseError = validationService.lettersAndNumbersOnly(fCtrl.newStudent.course);
        fCtrl.gradeError = validationService.numBetween(fCtrl.newStudent.grade, 0, 100);

        //if each pass validation test will return false
        if(!fCtrl.nameError && !fCtrl.courseError && !fCtrl.gradeError){
            //all inputs validate to true
            studentDataManipulation.resetErrors();
            //reset newStudent
            fCtrl.newStudent = {
                name: "",
                course: "",
                grade: null
            };
        }
    };
    fCtrl.resetForm = function () {
        studentDataManipulation.resetErrors();
        fCtrl.newStudent = {
            name: "",
            course: "",
            grade: null
        };
        fCtrl.nameError = false;
        fCtrl.courseError = false;
        fCtrl.gradeError = false;
    }
}).controller("studentListController", function (studentDataManipulation) {
    var slCtrl = this;
    slCtrl.loadError = false;
    //copy of the studentDataManipulation.studentDataCall
    slCtrl.studentData = studentDataManipulation.loadingResults;
    //DELETING STUDENTS
    slCtrl.deleteError = studentDataManipulation.deletingError;
    slCtrl.errorMessage = studentDataManipulation.deletingErrorMessage;
    slCtrl.deleteStudent = function (id) {
        studentDataManipulation.resetErrors();
        studentDataManipulation.studentDeleteCall(id);
    };
    //SORTING COLUMNS
    slCtrl.sortField = "";
    slCtrl.reverseSort = false;
    slCtrl.sorting = function(field){
        if(slCtrl.sortField === field){
            //set reverseSort to its opposite
            slCtrl.reverseSort = !slCtrl.reverseSort;
        }else{
            //new field reset reverseSort to false
            slCtrl.reverseSort = false;
            //set sortField to new field clicked
            slCtrl.sortField = field;
        }
    };
    //FILTERING
    slCtrl.filterText = {};
    slCtrl.filterField = "$";
    slCtrl.filterFieldDisplay = "";
});