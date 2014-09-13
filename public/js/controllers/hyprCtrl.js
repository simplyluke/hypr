angular.module('hypr', ['google-maps'])
  .controller('HyprCtrl', function HyprCtrl($scope, $routeParams, $filter) {
    $scope.map = {
        center: {
            latitude: 45,
            longitude: -73
        },
        zoom: 8
    };
  });