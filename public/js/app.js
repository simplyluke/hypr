var hypr = angular.module('hypr', ['google-maps']);


hypr.controller('HyprCtrl', function($scope) {
  $scope.lat = "0";
  $scope.lng = "0";
  $scope.markers = [];


  $scope.getLocation = function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position){
        onSuccess(position);
      });
    }
    else {
     console.log("Geolocation is not supported by this browser.");
    }
  };

  $scope.getLocation();

  $scope.map = {
    center: {
      latitude: 0,
      longitude: 0
    },
    zoom: 12
  };

  var onSuccess = function(position) {
    console.log(position.coords.latitude + ' ' + position.coords.longitude);
    $scope.map.center = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };


    $scope.$apply();
  };
});