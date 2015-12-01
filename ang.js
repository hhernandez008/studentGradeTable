var sgtApp = angular.module("sgtApp", []);

sgtApp.controller("appController", function($scope){
    var self = this;
    $scope.key = "JhpapQQx34";
    self.loadError = false;
    $scope.studentArray = [];
    self.loading = false;

    self.reloadStudents = function(){
        self.loadStudentsAjax();
    };

    self.calculateAverage = function(){
        var gradeQuantity = $scope.studentArray.length;
        var gradeSum = null;
        for(var i = 0; i < gradeQuantity; i++){
            gradeSum += $scope.studentArray[i].grade;
        }
        //return grade average
        return Math.round(gradeSum/gradeQuantity);
    };

    self.loadStudentsAjax = function(){
        //show loading gif
        self.loading = true;

        //ajax call to load students
        $.ajax({
            dataType: "json",
            data: {api_key: $scope.key},
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get",
            success: function(result) {
                var dataArr = result.data;
                if(result.success){
                    //remove loading gif
                    self.loading = false;
                    //empty array before loading data
                    $scope.studentArray = [];
                    //add student data from server
                    for(var i = 0; i < dataArr.length; i++){
                        //remove any excess whitespace before storing & adding to DOM
                        dataArr[i].name = dataArr[i].name.trim();
                        dataArr[i].course = dataArr[i].course.trim();
                        dataArr[i].deleteError = false;
                        //add student to array; object properties: id(num), name(string), grade(num), course(string)
                        $scope.studentArray.unshift(dataArr[i]);
                    }
                }else {
                    //remove loading gif
                    self.loading = false;
                    //show error message
                    self.loadError = true;
                }
                //run digest of $scope service
                $scope.$digest();
            }, //end success function
            error: function(){
                //remove loading gif
                self.loading = false;
                //show error message
                self.loadError = true;
                //run digest of $scope service
                $scope.$digest();
            }
        }); //end ajax call
    }; //end loadStudentsAjax

    //load student data on controller load
    self.loadStudentsAjax();
}); //end appController

sgtApp.controller("formController", function($scope){
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
        $.ajax({
            dataType: "json",
            data: {
                api_key: $scope.key,
                name: self.newStudent.name,
                course: self.newStudent.course,
                grade: self.newStudent.grade
            },
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create",
            //add id to this.newStudent
            success: function (response) {
                if (response.success) {
                    self.newStudent.id = response.new_id;
                    self.newStudent.deleteError = false;
                    //place object in studentArray
                    $scope.studentArray.unshift(self.newStudent);

                    //clear input form
                    self.newStudent = {};
                } else {
                    self.addStudentError = true;
                }
                // clearing the newStudent object but not looping through the studentArray
                $scope.$digest();
            }, //end success function
            error: function () {
                self.addStudentError = true;
                $scope.$digest();
            }
        });
    };
});

sgtApp.controller("studentListController", function($scope){

    this.deleteStudent = function(index){
        //ajax call to delete student on success delete student
        var studentID = $scope.studentArray[index].id;
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
                    $scope.studentArray.splice(index, 1);
                }else{
                    $scope.studentArray[index].deleteError = true;
                    $scope.studentArray[index].deleteErrorMessage = "You are not authorized to delete this student.";
                }
                $scope.$digest();
            }, //end success function
            error: function(){
                $scope.studentArray[index].deleteError = true;
                $scope.studentArray[index].deleteErrorMessage = "You are not authorized to delete this student.";
                $scope.$digest();
            }
        }); //end ajax call
    };

    //highlight min & max students
});
