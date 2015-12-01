var sgtApp = angular.module("sgtApp", []);

sgtApp.controller("appController", function($scope){
    var self = this;
    self.key = "JhpapQQx34";
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
        //add loading image when student data is loading or reloading
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
        $("tbody").prepend($row);

        //ajax call to load students
        $.ajax({
            dataType: "json",
            data: {api_key: this.key},
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get",
            success: function(result) {
                var dataArr = result.data;
                if(result.success){
                    //clear DOM
                    $(".loading").remove();

                    //add student data from server
                    for(var i = 0; i < dataArr.length; i++){
                        //remove any excess whitespace before storing & adding to DOM
                        dataArr[i].name = dataArr[i].name.trim();
                        dataArr[i].course = dataArr[i].course.trim();
                        dataArr[i].grade = parseInt(dataArr[i].grade);
                        //add student to array
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
            }
        }); //end ajax call
    }
});

sgtApp.controller("formController", function($scope){
    //Handles inputs & validation thru angular
    //add new student to array after successful ajax call, error handling
    this.newStudent = {};

    this.addStudent = function(){
        //verify valid inputs
        //insert newStudent at the start of the array
        $scope.studentArray.unshift(this.newStudent);
        this.newStudent = {};
    };

    //auto-complete for name & course
});

sgtApp.controller("studentListController", function($scope){
    //handle student delete & errors
    this.deleteStudent = function(num){
        //ajax call to delete student on success delete student
        $scope.studentArray.splice(num, 1);
    };

    //highlight min & max students
});
