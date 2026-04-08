/**
 * FlightSearchService
 * Uses Restangular for API calls with Lodash and Moment.js transformations.
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('FlightSearchService', ['Restangular', '$q', function(Restangular, $q) {

      var flightsEndpoint = Restangular.all('flights');

      /**
       * Search flights with given parameters
       * @param {Object} params - search criteria
       * @returns {Promise<Array>}
       */
      this.search = function(params) {
        return flightsEndpoint.getList(params).then(function(results) {
          // Transform results using Lodash and Moment
          return _.map(results, function(flight) {
            flight.departureFormatted = moment(flight.departureTime, 'HH:mm').format('h:mm A');
            flight.arrivalFormatted = moment(flight.arrivalTime, 'HH:mm').format('h:mm A');
            flight.durationFormatted = _formatDuration(flight.durationMinutes);
            flight.priceFormatted = '$' + flight.price.toFixed(2);
            flight.departDateFormatted = moment(flight.departDate).format('ddd, MMM D');
            return flight;
          });
        });
      };

      /**
       * Book a flight
       * @param {string} flightId
       * @param {Object} bookingDetails
       * @returns {Promise}
       */
      this.bookFlight = function(flightId, bookingDetails) {
        return Restangular.one('flights', flightId).customPOST(bookingDetails, 'book');
      };

      /**
       * Get popular routes
       * @returns {Promise<Array>}
       */
      this.getPopularRoutes = function() {
        return Restangular.all('flights/popular').getList();
      };

      /**
       * Get flight details by ID
       * @param {string} flightId
       * @returns {Promise}
       */
      this.getFlightDetails = function(flightId) {
        return Restangular.one('flights', flightId).get();
      };

      /**
       * Get available airports for autocomplete
       * @param {string} query
       * @returns {Promise<Array>}
       */
      this.searchAirports = function(query) {
        return Restangular.all('airports').getList({ q: query }).then(function(airports) {
          return _.sortBy(airports, 'name');
        });
      };

      // --- Private helpers ---
      function _formatDuration(minutes) {
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        return h + 'h ' + m + 'm';
      }
    }]);
})();
