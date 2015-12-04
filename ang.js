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
        var object = obj;
        var data = "api_key=" + apiKey + "&" + student.dataObjToString(obj);
        $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/create"
        }).then(function (result) {
            if (result.data.success) {
                object.id = result.data.new_id;
                //add student to the start of the array
                student.studentArray.unshift(object);
                //return empty object to clear the object passed in
                object = {};
                return object;
            } else {
                student.addError = true;
                $log.error(result.data.errors[0]);
                return object;
            }
        }, function () {
            $log.error("Unsuccessful call to http://s-apis.learningfuze.com/sgt/create");
            student.addError = true;
            return object;
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
    student.studentDeleteCall = function (studentId) {
        var data = "api_key=" + apiKey + "&student_id=" + studentId;
        $http({
            data: data,
            method: "post",
            url: "http://s-apis.learningfuze.com/sgt/delete"
        }).then(function (result) {
            if (result.data.success) {
                //search studentArray for the matching id
                var i = 0;
                while(i < student.studentArray.length){
                    if(student.studentArray[i].id === studentId){
                        student.studentArray.splice(i, 1);
                        return;
                    }
                    i++;
                }

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
}) //end studentDataService
    .service("validationService", function(){
        //if there is an incorrect match return true, else param passes & return false
        /**
         * Check if the string passed in contains any characters besides letters, spaces or dashes.
         * Then check if the length is at least 2 characters.
         * @param string
         * @returns {boolean}
         */
        this.lettersOnly = function(string){
            //if string contains any numbers or unwanted characters return error
            if(string.search(/([^A-z -])/) >= 0){
                //any string that contains characters other than letters & spaces
                return true;
            }else if(string.length < 2){
                //any string with less than three characters
                return true;
            }
            return false;
        };

        /**
         * Check if the string passed in contains any characters besides letters, numbers, & spaces.
         * Then check that the length is at least 2 characters.
         * @param string
         * @returns {boolean}
         */
        this.lettersAndNumbersOnly = function(string){
            //if string contains any special characters return error
            if(string.search(/([^\w\s])/) >= 0){
                return true;
            }else if(string.length < 2){
                //any string with less than three characters
                return true;
            }
            return false;
        };

        /**
         * Check if the num passed in is within the range of the minNum & maxNum
         * @param num
         * @param minNum
         * @param maxNum
         * @returns {boolean}
         */
        this.numBetween = function(num, minNum, maxNum){
            //make sure num is a number
            if(typeof(num) != "number"){
                num = parseFloat(num);
                if(isNaN(num)){
                    return true;
                }
            }
            //if num is outside of minNum & maxNum range return error
            if(num < minNum || num > maxNum){
                return true;
            }
            return false;
        };
    });

