var sgtApp = angular.module("sgtApp", []);

sgtApp.config(['$httpProvider', function ($httpProvider) {
    //Reset headers to avoid OPTIONS request (aka preflight)
    $httpProvider.defaults.headers.post = {};
}]);

/*sgtApp.factory("studentService", function($http){
    var key = "JhpapQQx34";
     var ajaxCall = function(dataObject, action){
         var url = "http://s-apis.learningfuze.com/sgt/" + action;
         return $http.post(url, dataObject);
     };

    return {
        getStudents: function(){
            var obj = {api_key: "JhpapQQx34"};
            console.log("obj", obj);
            return ajaxCall(obj, "get");
        },
        addNewStudents: function(student){
            var obj = {
                api_key: key,
                name: student.name,
                course: student.course,
                grade: student.grade
            };
            return ajaxCall(obj, "create");
        },
        deleteStudents: function(id){
            var obj = {
                api_key: key,
                student_id: id
            };
            return ajaxCall(obj, "delete");
        }
    };
});*/

sgtApp.controller("appController", function($scope, $http){
    //Student Loading from API
    $scope.studentArray = [];

    this.reloadStudents = function(){
        $http({
            method: "post",
            data: {api_key: "JhpapQQx34"},
            url: "http://s-apis.learningfuze.com/sgt/get"

        })
            .then(function successCallback(response){
                console.log(response);
            }, function errorCallback(response){
                console.log("error");
            });
    };

    this.calculateAverage = function(){
        var gradeQuantity = $scope.studentArray.length;
        var gradeSum = null;
        for(var i = 0; i < gradeQuantity; i++){
            gradeSum += $scope.studentArray[i].grade;
        }
        //return grade average
        return Math.round(gradeSum/gradeQuantity);
    };
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
