/**
 * Authentication Service
 * Uses localStorage for token storage (legacy pattern)
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('AuthService', ['$http', '$rootScope', function($http, $rootScope) {
      var self = this;

      /**
       * Login user
       * @param {string} email 
       * @param {string} password 
       */
      this.login = function(email, password) {
        return $http.post('http://localhost:3000/api/auth/login', {
          email: email,
          password: password
        }).then(function(response) {
          localStorage.setItem('authToken', response.data.token);
          $rootScope.currentUser = response.data.user;
          $rootScope.$broadcast('auth:login', response.data.user);
          return response.data;
        });
      };

      /**
       * Logout user
       */
      this.logout = function() {
        localStorage.removeItem('authToken');
        $rootScope.currentUser = null;
        $rootScope.$broadcast('auth:logout');
      };

      /**
       * Check if user is authenticated
       * @returns {boolean}
       */
      this.isAuthenticated = function() {
        return !!localStorage.getItem('authToken');
      };

      /**
       * Get current user from localStorage
       * @returns {Object|null}
       */
      this.getCurrentUser = function() {
        return $rootScope.currentUser;
      };
    }]);
})();
