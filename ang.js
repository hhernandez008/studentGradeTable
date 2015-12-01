var sgtApp = angular.module("sgtApp", []);

sgtApp.controller("appController", function($scope){
    var self = this;
    $scope.key = "JhpapQQx34";
    self.loadError = false;
    $scope.studentArray = [];

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
       //load using angular on DOM
       /* //add loading image when student data is loading or reloading
        var $loading = $("<img>",{
            src: "images/loading.gif"
        });
        var $tcell = $("<td>", {
            colspan: "4",
            style: "text-align: center"
        }).append($loading);
        var $row = $("<tr>",{
            class: "loading"
        }).append($tcell);
        $("tbody").prepend($row);*/

        //ajax call to load students
        $.ajax({
            dataType: "json",
            data: {api_key: $scope.key},
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get",
            success: function(result) {
                var dataArr = result.data;
                if(result.success){
                    //clear DOM
                    $(".loading").remove();
                    //empty array before loading data
                    $scope.studentArray = [];
                    //add student data from server
                    for(var i = 0; i < dataArr.length; i++){
                        //remove any excess whitespace before storing & adding to DOM
                        dataArr[i].name = dataArr[i].name.trim();
                        dataArr[i].course = dataArr[i].course.trim();
                        //add student to array; object properties: id(num), name(string), grade(num), course(string)
                        $scope.studentArray.push(dataArr[i]);
                    }
                }else {
                    $(".loading").remove();
                    self.loadError = true;
                }
                //run digest of $scope service
                $scope.$digest();
            }, //end success function
            error: function(){
                $(".loading").remove();
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
                grade: self.newStudent.grade,
                "force-failure": "server"
            },
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create",
            //add id to this.newStudent
            success: function (response) {
                if (response.success) {
                    self.newStudent.id = response.new_id;

                    //place object in studentArray
                    $scope.studentArray.unshift(self.newStudent);

                    //clear input form
                    self.newStudent = {};
                } else {
                    self.addStudentError = true;
                }
                $scope.$digest();
            }, //end success function
            error: function () {
                self.addStudentError = true;
                $scope.$digest();
            }
        });
    };
    //auto-complete for name & course
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
                    /*var $errorMessage = $("<p>", {
                        style: "color: #f0ad4e; font-weight: bold",
                        text:"You are not authorized to delete this student."
                    });
                    $(element).after($errorMessage);*/
                }
                $scope.$digest();
            }, //end success function
            error: function(){
                /*var $errorMessage = $("<p>", {
                    style: "color: #f0ad4e; font-weight: bold",
                    text: "Unable to delete this student from server. Try again later"
                });
                $(element).after($errorMessage);*/
            }
        }); //end ajax call
    };

    //highlight min & max students
});
