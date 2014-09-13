var hypr = angular.module('hypr', ['google-maps']);


hypr.controller('HyprCtrl', function($scope) {
  // default the scope lat and long
  $scope.lat = "0";
  $scope.lng = "0";
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


    $scope.$apply();
  };

  // map style

  $scope.map.style = styleArray = [
  {
    featureType: "all",
    stylers: [
      { saturation: -80 }
    ]
  },{
    featureType: "road.arterial",
    // elementType: "geometry",
    stylers: [
      { hue: "#00ffee" },
      { saturation: 50 }
    ]
  },{
    featureType: "poi.business",
    elementType: "labels",
    stylers: [
      { visibility: "off" }
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
    zoom: 12,
    // custom google maps options
    options: {
      // disable a shit ton of map features
      zoomControl: false,
      // minZoom *should* be redundant but I'd rather not let them zoom out to the world view
      minZoom: 11,
      scrollwheel: false,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false
    }
  };



});