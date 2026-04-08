/**
 * API Service - Restangular wrapper
 * Additional abstraction layer (legacy pattern)
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('ApiService', ['Restangular', function(Restangular) {
      
      /**
       * Get all resources from endpoint
       * @param {string} endpoint 
       * @returns {Promise}
       */
      this.getAll = function(endpoint) {
        return Restangular.all(endpoint).getList();
      };

      /**
       * Get single resource by ID
       * @param {string} endpoint 
       * @param {string|number} id 
       * @returns {Promise}
       */
      this.getOne = function(endpoint, id) {
        return Restangular.one(endpoint, id).get();
      };

      /**
       * Create new resource
       * @param {string} endpoint 
       * @param {Object} data 
       * @returns {Promise}
       */
      this.create = function(endpoint, data) {
        return Restangular.all(endpoint).post(data);
      };

      /**
       * Update existing resource
       * @param {string} endpoint 
       * @param {string|number} id 
       * @param {Object} data 
       * @returns {Promise}
       */
      this.update = function(endpoint, id, data) {
        return Restangular.one(endpoint, id).customPUT(data);
      };

      /**
       * Delete resource
       * @param {string} endpoint 
       * @param {string|number} id 
       * @returns {Promise}
       */
      this.delete = function(endpoint, id) {
        return Restangular.one(endpoint, id).remove();
      };
    }]);
})();
