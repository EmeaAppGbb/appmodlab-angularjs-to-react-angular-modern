/**
 * GlobalTravel Corp - Main Application Module
 * AngularJS 1.6.x legacy application
 */
(function() {
  'use strict';

  angular.module('globalTravelApp', [
    'ui.router',
    'ui.bootstrap',
    'restangular'
  ])
  .config(['RestangularProvider', function(RestangularProvider) {
    RestangularProvider.setBaseUrl('http://localhost:3000/api');
    RestangularProvider.setDefaultHeaders({
      'Content-Type': 'application/json'
    });
    
    // Add auth token interceptor
    RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers, params) {
      var token = localStorage.getItem('authToken');
      if (token) {
        headers.Authorization = 'Bearer ' + token;
      }
      return {
        headers: headers
      };
    });
  }])
  .run(['$rootScope', '$state', 'AuthService', function($rootScope, $state, AuthService) {
    // Global event bus for cross-component communication (legacy anti-pattern)
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      if (toState.data && toState.data.requireAuth && !AuthService.isAuthenticated()) {
        event.preventDefault();
        $state.go('login');
      }
    });

    // Legacy: Using $rootScope for global state (anti-pattern)
    $rootScope.currentUser = null;
    $rootScope.notifications = [];

    // Legacy: $rootScope event for notifications
    $rootScope.$on('notification:add', function(event, message, type) {
      $rootScope.notifications.push({
        message: message,
        type: type || 'info',
        timestamp: new Date()
      });
    });
  }]);
})();
