angular.module('hypr', ['ngRoute'])
  .config(function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'HyprCtrl',
      templateUrl: 'hypr-index.html'
    }).otherwise({
      redirectTo: '/'
    });
  });