var hypr = angular.module('hypr', ['google-maps', 'btford.socket-io']);

hypr.factory('socket', function(socketFactory) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function(){
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});
hypr.controller('HyprCtrl', function($scope, socket) {
  // default the scope lat and long
  $scope.userLocation = {latitude: 0, longitude: 0};
  $scope.markers = [];

  // get user geolocation - yay html5
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
  // fire the get event
  $scope.getLocation();

  // onSuccess is the callback for the geolocation get 
  // this function executes upon successful retrieval of the user's location
  // updates the map scope
  var onSuccess = function(position) {
    console.log(position.coords.latitude + ' ' + position.coords.longitude);
    $scope.map.center = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    $scope.userLocation = {latitude: position.coords.latitude, longitude: position.coords.longitude};
    $scope.$apply();
  };

  // map style

  var style = styleArray = [
    {
      featureType: "all",
      stylers: [
        {saturation: '-10'}
      ]
    },{
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {hue: "#898a90"}
      ]
    },{
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [
        {hue: "#f4f4f4"}
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {visibility: "on"},
        { color: "#f4f4f4" }
        
      ]
    },{
      featureType: "landscape",
      elementType: "geometry",
      stylers: [
        {color: "#898a90"}
       
      ]
    },{
      featureType: "landscape.manmade",
      elementType: "geometry.fill",
      stylers: [
        {color: "#898a90"}
      ]
    },{
      featureType: "water",
      elementType: "labels",
      stylers: [
        {visibility: "off"}
      ]
    },{
      featureType: "water",
      stylers: [
        { color: "#4c4c4c" }
      ]
    },{
      featureType: "transit",
      stylers: [
        {visibility: "off"}
      ]
    }
  ];


  // set up the map parts of the scope
  $scope.map = {
    center: {
      // default to Upenn
      latitude: 39.951715199999995,
      longitude: -75.1915001
    },
    zoom: 14,
    // custom google maps options
    options: {
      // disable a shit ton of map features
      zoomControl: true,
      // minZoom *should* be redundant but I'd rather not let them zoom out to the world view
      minZoom: 12,
      scrollwheel: true,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      styles: style
    }
  };

  // WEBSOCKETS HOLLER BACK


  // socket.on("connection", function(){
  //   console.log("connected!");
  // });

  // socket.forward('data', $scope);
  // $scope.$on('socket:data', function(ev, data){
  //   $scope.markers = data;
  // });


});