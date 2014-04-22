'use strict';

var movieMakerApp = angular.module('movieMakerApp', ['ng-route', 'ui', 'jqyoui'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
