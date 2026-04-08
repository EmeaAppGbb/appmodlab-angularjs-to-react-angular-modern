/**
 * HotelBookingService
 * Uses Restangular for API calls with Lodash and Moment.js transformations.
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('HotelBookingService', ['Restangular', '$q', function(Restangular, $q) {

      var hotelsEndpoint = Restangular.all('hotels');

      /**
       * Search hotels by criteria
       * @param {Object} params
       * @returns {Promise<Array>}
       */
      this.searchHotels = function(params) {
        return hotelsEndpoint.getList(params).then(function(results) {
          return _.map(results, function(hotel) {
            hotel.ratingText = _getRatingText(hotel.rating);
            hotel.priceFormatted = '$' + hotel.pricePerNight.toFixed(2);
            hotel.amenitiesText = _.join(hotel.amenities, ', ');
            hotel.reviewSummary = hotel.reviewCount + ' reviews';
            return hotel;
          });
        });
      };

      /**
       * Get rooms for a specific hotel
       * @param {string} hotelId
       * @param {Object} dates
       * @returns {Promise<Array>}
       */
      this.getHotelRooms = function(hotelId, dates) {
        return Restangular.one('hotels', hotelId).getList('rooms', dates).then(function(rooms) {
          return _.sortBy(rooms, 'pricePerNight');
        });
      };

      /**
       * Book a hotel room
       * @param {Object} bookingData
       * @returns {Promise}
       */
      this.bookRoom = function(bookingData) {
        return Restangular.all('bookings/hotels').post(bookingData);
      };

      /**
       * Get hotel details
       * @param {string} hotelId
       * @returns {Promise}
       */
      this.getHotelDetails = function(hotelId) {
        return Restangular.one('hotels', hotelId).get();
      };

      /**
       * Get hotel reviews
       * @param {string} hotelId
       * @param {number} page
       * @returns {Promise<Array>}
       */
      this.getReviews = function(hotelId, page) {
        return Restangular.one('hotels', hotelId).getList('reviews', { page: page || 1 });
      };

      // --- Private helpers ---
      function _getRatingText(rating) {
        if (rating >= 4.5) return 'Exceptional';
        if (rating >= 4.0) return 'Excellent';
        if (rating >= 3.5) return 'Very Good';
        if (rating >= 3.0) return 'Good';
        return 'Average';
      }
    }]);
})();
