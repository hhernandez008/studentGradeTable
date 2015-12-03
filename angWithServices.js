var sgtApp = angular.module("sgtApp", []);

sgtApp.config(['$httpProvider', function ($httpProvider) {
    //Set headers content-type to x-www-form-urlencoded
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}]);

sgtApp.factory("dataService", function($http){
    var student = {};
    student.studentArray = [];
    var apiKey = "JhpapQQx34";

    student.dataObjToString = function(obj){
        obj = $.param(obj);
        return obj;
    };
    student.studentDataCall = function(){
        return $http({
            data: "api_key=" + apiKey,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/get"
        });
    };
    student.studentAddCall = function(obj){
        var data = "api_key=" + apiKey + "&" + student.dataObjToString(obj);
        console.log("studentAddCall data: ", data);
        return $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create"
        });
    };
    return student;
});