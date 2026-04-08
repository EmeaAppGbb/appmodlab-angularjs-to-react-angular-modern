/**
 * GlobalTravel Corp - Date Format Filter
 * Uses Moment.js for date formatting (legacy pattern).
 * Anti-patterns:
 *   - Moment.js dependency for simple formatting
 *   - Global moment object usage (not injected)
 *   - No timezone handling
 *   - Should use native Intl.DateTimeFormat or Angular's built-in date filter
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .filter('gtDateFormat', function() {
      return function(dateValue, format) {
        if (!dateValue) {
          return '';
        }

        // Anti-pattern: relying on global moment object
        var m = moment(dateValue);
        if (!m.isValid()) {
          return 'Invalid Date';
        }

        // Anti-pattern: custom format strings instead of locale-aware formatting
        var formatMap = {
          'short': 'MM/DD/YYYY',
          'medium': 'MMM D, YYYY',
          'long': 'MMMM D, YYYY',
          'full': 'dddd, MMMM D, YYYY',
          'time': 'h:mm A',
          'datetime': 'MMM D, YYYY h:mm A',
          'relative': 'relative',
          'iso': 'YYYY-MM-DD'
        };

        var resolvedFormat = formatMap[format] || format || 'MMM D, YYYY';

        if (resolvedFormat === 'relative') {
          return m.fromNow();
        }

        return m.format(resolvedFormat);
      };
    })
    .filter('gtTimeAgo', function() {
      // Anti-pattern: separate filter that also depends on Moment.js
      return function(dateValue) {
        if (!dateValue) {
          return '';
        }
        var m = moment(dateValue);
        if (!m.isValid()) {
          return '';
        }
        return m.fromNow();
      };
    })
    .filter('gtDuration', function() {
      // Anti-pattern: Moment.js for duration formatting
      return function(minutes) {
        if (!minutes && minutes !== 0) {
          return '';
        }
        var duration = moment.duration(minutes, 'minutes');
        var hours = Math.floor(duration.asHours());
        var mins = duration.minutes();

        if (hours > 0) {
          return hours + 'h ' + mins + 'm';
        }
        return mins + 'm';
      };
    });
})();
