/**
 * TravelRequestService
 * Uses Restangular for API calls with Lodash and Moment.js transformations.
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('TravelRequestService', ['Restangular', '$q', function(Restangular, $q) {

      var requestsEndpoint = Restangular.all('travel-requests');

      /**
       * Get all travel requests
       * @returns {Promise<Array>}
       */
      this.getRequests = function() {
        return requestsEndpoint.getList().then(function(requests) {
          return _.map(requests, function(req) {
            req.departFormatted = moment(req.departDate).format('MMM D, YYYY');
            req.returnFormatted = moment(req.returnDate).format('MMM D, YYYY');
            req.createdFormatted = moment(req.createdAt).format('MMM D, YYYY h:mm A');
            req.tripDuration = moment(req.returnDate).diff(moment(req.departDate), 'days');
            req.totalFormatted = '$' + (req.totalEstimate || 0).toFixed(2);
            req.daysUntilTravel = moment(req.departDate).diff(moment(), 'days');
            return req;
          });
        });
      };

      /**
       * Get a single travel request by ID
       * @param {string} requestId
       * @returns {Promise}
       */
      this.getRequest = function(requestId) {
        return Restangular.one('travel-requests', requestId).get();
      };

      /**
       * Submit a new travel request
       * @param {Object} requestData
       * @returns {Promise}
       */
      this.submitRequest = function(requestData) {
        return requestsEndpoint.post(requestData);
      };

      /**
       * Update an existing travel request
       * @param {string} requestId
       * @param {Object} requestData
       * @returns {Promise}
       */
      this.updateRequest = function(requestId, requestData) {
        return Restangular.one('travel-requests', requestId).customPUT(requestData);
      };

      /**
       * Cancel a travel request
       * @param {string} requestId
       * @returns {Promise}
       */
      this.cancelRequest = function(requestId) {
        return Restangular.one('travel-requests', requestId).customPUT({ status: 'cancelled' });
      };

      /**
       * Get approval history for a request
       * @param {string} requestId
       * @returns {Promise<Array>}
       */
      this.getApprovalHistory = function(requestId) {
        return Restangular.one('travel-requests', requestId).getList('approvals').then(function(approvals) {
          return _.map(approvals, function(a) {
            a.dateFormatted = moment(a.date).format('MMM D, YYYY h:mm A');
            return a;
          });
        });
      };

      /**
       * Get travel policy limits
       * @returns {Promise}
       */
      this.getPolicyLimits = function() {
        return Restangular.one('travel-policy').get();
      };
    }]);
})();
