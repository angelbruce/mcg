angular.module('com.abl.image', [])
    .directive('imageBox', function () {
        return {
            restrict:'EA',
            controller:['$scope',function(scope){
                
            }]
        };
    });

var app = angular.module('com.abl.main', []);
app.controller('main', ['$scope', '$http', '$sce', function (scope, http, sce) {

}]);

