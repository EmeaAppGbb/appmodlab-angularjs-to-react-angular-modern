/**
 * ItineraryService
 * Uses Restangular for API calls with Lodash and Moment.js transformations.
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('ItineraryService', ['Restangular', '$q', function(Restangular, $q) {

      /**
       * Get all trips for the current user
       * @returns {Promise<Array>}
       */
      this.getTrips = function() {
        return Restangular.all('trips').getList().then(function(trips) {
          return _.map(trips, function(trip) {
            trip.itemCount = trip.items ? trip.items.length : 0;
            trip.totalCost = trip.items ? _.sumBy(trip.items, 'cost') : 0;
            return trip;
          });
        });
      };

      /**
       * Get detailed trip information
       * @param {string} tripId
       * @returns {Promise}
       */
      this.getTripDetails = function(tripId) {
        return Restangular.one('trips', tripId).get().then(function(trip) {
          // Enrich each item with formatted data
          trip.items = _.map(trip.items, function(item) {
            item.dateFormatted = moment(item.date).format('MMM D, YYYY');
            item.timeFormatted = item.time ? moment(item.time, 'HH:mm').format('h:mm A') : '';
            item.costFormatted = '$' + (item.cost || 0).toFixed(2);
            return item;
          });
          return trip;
        });
      };

      /**
       * Add a note to an itinerary item
       * @param {string} itemId
       * @param {string} noteText
       * @returns {Promise}
       */
      this.addNote = function(itemId, noteText) {
        return Restangular.one('itinerary-items', itemId).customPOST(
          { text: noteText, createdAt: moment().toISOString() },
          'notes'
        );
      };

      /**
       * Cancel an itinerary item
       * @param {string} itemId
       * @returns {Promise}
       */
      this.cancelItem = function(itemId) {
        return Restangular.one('itinerary-items', itemId).customPUT({ status: 'cancelled' });
      };

      /**
       * Create a new trip
       * @param {Object} tripData
       * @returns {Promise}
       */
      this.createTrip = function(tripData) {
        return Restangular.all('trips').post(tripData);
      };

      /**
       * Update trip details
       * @param {string} tripId
       * @param {Object} data
       * @returns {Promise}
       */
      this.updateTrip = function(tripId, data) {
        return Restangular.one('trips', tripId).customPUT(data);
      };

      /**
       * Delete a trip
       * @param {string} tripId
       * @returns {Promise}
       */
      this.deleteTrip = function(tripId) {
        return Restangular.one('trips', tripId).remove();
      };

      /**
       * Share trip with another user
       * @param {string} tripId
       * @param {string} email
       * @returns {Promise}
       */
      this.shareTrip = function(tripId, email) {
        return Restangular.one('trips', tripId).customPOST({ email: email }, 'share');
      };
    }]);
})();
