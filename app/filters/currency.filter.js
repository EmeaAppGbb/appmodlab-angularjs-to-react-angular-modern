/**
 * GlobalTravel Corp - Currency Filter
 * Formats numbers as USD currency.
 * Anti-patterns:
 *   - Manual string formatting instead of Intl.NumberFormat
 *   - No locale support
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .filter('usdCurrency', function() {
      return function(amount, showCents, showSymbol) {
        if (amount === null || amount === undefined || amount === '') {
          return showSymbol !== false ? '$0.00' : '0.00';
        }

        var num = parseFloat(amount);
        if (isNaN(num)) {
          return showSymbol !== false ? '$0.00' : '0.00';
        }

        var isNegative = num < 0;
        num = Math.abs(num);

        // Anti-pattern: manual currency formatting instead of using Intl.NumberFormat
        var formatted;
        if (showCents === false) {
          formatted = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else {
          formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        var result = '';
        if (isNegative) {
          result += '-';
        }
        if (showSymbol !== false) {
          result += '$';
        }
        result += formatted;

        return result;
      };
    });
})();
