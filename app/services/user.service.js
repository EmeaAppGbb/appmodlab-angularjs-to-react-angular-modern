/**
 * User Service - User profile management
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('UserService', ['Restangular', '$rootScope', function(Restangular, $rootScope) {
      
      /**
       * Get user profile
       * @returns {Promise}
       */
      this.getProfile = function() {
        return Restangular.one('users', 'me').get().then(function(user) {
          $rootScope.currentUser = user;
          return user;
        });
      };

      /**
       * Update user preferences
       * @param {Object} preferences 
       * @returns {Promise}
       */
      this.updatePreferences = function(preferences) {
        return Restangular.one('users', 'me').customPUT({ preferences: preferences });
      };
    }]);
})();
