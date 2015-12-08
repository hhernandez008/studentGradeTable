var sgtApp = angular.module("sgtApp", ["firebase"]);

sgtApp.config(['$httpProvider', function ($httpProvider) {
    //Set headers content-type to x-www-form-urlencoded
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
}]);

sgtApp.factory("studentDataRetrieval", function($log, $firebaseArray){
    var sdr = {};
    var firebaseRef = new Firebase("https://intense-heat-9651.firebaseio.com/data");
    //Collect student data retrieved from database
    sdr.studentArray = $firebaseArray(firebaseRef);
    sdr.loaded;
    //Reverse display of the array
    sdr.studentArray.$loaded()
        .then(function(x){
            if(x === sdr.studentArray) {
                sdr.loaded = true;
            }else{
                $log.error("Error: Unable to load student data");
                sdr.loaded = false;
            }
        })
        .catch(function(error){
            $log.error("Error:", error);
            sdr.loaded = false;
        });
    return sdr;
}).service("studentDataManipulation", function (studentDataRetrieval, $firebase, $log) {
    var sdm = this;
    var studentList = studentDataRetrieval.studentArray;

    /**
     * LOADING STUDENT DATA
     */
    //return the student array in reverse order so latest entries appear on top
    sdm.loadingResults = function () {
        if(studentDataRetrieval.loaded) {
            var reverseArray = [];
            for(var i = studentList.length - 1; i >= 0; i--){
                reverseArray.push(studentList[i]);
            }
            return reverseArray;
        }
    };
    //return a load error indication
    sdm.loadingError = function () {
        return studentDataRetrieval.loaded;
    };

    /**
     * ADDING STUDENTS
     */
    sdm.addError = false;
    /**
     * Send the newly created student object to the database & on success add the student and
     * the returned id to the student array
     * @param obj
     */
    sdm.studentAddCall = function (obj) {
        studentList.$add(obj)
            .then(function (ref) {
                //success
            }, function () {
                sdm.addError = true;
                $log.error("Unable to add student");
            });
    };
    //return add student error indicator
    sdm.addingError = function () {
        return sdm.addError;
    };

    /**
     * DELETING STUDENTS
     */

    sdm.delteError = false;
    /**
     * Send the the student to delete to the database.
     * On success delete the student form the student array.
     * @param obj
     */
    sdm.studentDeleteCall = function (id) {
        var key = studentList.$indexFor(id);
        studentDataRetrieval.studentArray.$remove(key)
            .then(function (ref) {
                //success
            }, function () {
                sdm.deleteError = true;
                $log.error("Unable to delete student");
            });
    };
    //return delete student error indicators
    sdm.deletingError = function () {
        return sdm.deleteError;
    };
    //return delete student error message
    sdm.deletingErrorMessage = function () {
        return "Unable to delete this student.";
    };

    /**
     * Reset all errors to original value
     */
    sdm.resetErrors = function () {
        sdm.loadError = false;
        sdm.addError = false;
        sdm.deleteError = false;
        sdm.deleteErrorMessage = "";
    };
}) //end studentDataManipulation
    .service("studentDataInformation", function(studentDataRetrieval){
        var studentList = studentDataRetrieval.studentArray;
        //calculate average
        this.calculateAverageGrade = function () {
            var gradeSum = 0;
            var numGrades = 0;
            for (var i = 0; i < studentList.length; i++) {
                gradeSum += studentList[i].grade;
                numGrades++;
            }
            return Math.round(gradeSum / numGrades);
        };

        //FIND HIGHEST & LOWEST VALUES
        this.highLowValues = function(property){
            var values = {};
            for(var i = 0; i < studentList.length; i++){
                if(i == 0){
                    values.low = studentList[i][property];
                }else if(studentList[i][property] < values.low){
                    values.low = studentList[i][property];
                }
            }
            for(var j = 0; j < studentList.length; j++) {
                if (j == 0){
                    values.high = studentList[j][property];
                } else if(studentList[j][property] > values.high) {
                    values.high = studentList[j][property];
                }
            }
            return values;
        };

    })
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

