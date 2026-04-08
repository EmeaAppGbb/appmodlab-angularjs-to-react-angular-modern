/**
 * GlobalTravel Corp - Currency Input Directive
 * Legacy pattern: Uses jQuery for DOM manipulation and formatting.
 * Anti-patterns:
 *   - jQuery event binding instead of Angular directives
 *   - Manual $apply() calls
 *   - String-based currency formatting logic in directive
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .directive('gtCurrencyInput', ['$timeout', function($timeout) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          currencySymbol: '@',
          maxValue: '=?',
          allowNegative: '=?'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
          var symbol = scope.currencySymbol || '$';
          var $el = $(element);

          // Anti-pattern: jQuery class/attr manipulation
          $el.addClass('gt-currency-input');
          $el.attr('inputmode', 'decimal');

          // Anti-pattern: jQuery event binding instead of ng-blur/ng-focus
          $el.on('focus', function() {
            var rawValue = ngModelCtrl.$modelValue;
            if (rawValue !== null && rawValue !== undefined) {
              $el.val(rawValue.toFixed(2));
            }
            // Anti-pattern: jQuery class toggle
            $el.addClass('editing');
            $el.parent().addClass('currency-field-active');
          });

          $el.on('blur', function() {
            // Anti-pattern: manual $apply to sync with Angular
            scope.$apply(function() {
              var val = parseFloat($el.val().replace(/[^0-9.\-]/g, ''));
              if (isNaN(val)) {
                val = 0;
              }
              if (!scope.allowNegative && val < 0) {
                val = 0;
              }
              if (scope.maxValue && val > scope.maxValue) {
                val = scope.maxValue;
                // Anti-pattern: jQuery animation for validation feedback
                $el.css('background-color', '#fff3cd');
                $timeout(function() {
                  $el.css('background-color', '');
                }, 1500);
              }
              ngModelCtrl.$setViewValue(val);
              $el.val(symbol + val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
            });
            $el.removeClass('editing');
            $el.parent().removeClass('currency-field-active');
          });

          // Anti-pattern: jQuery keydown event instead of ng-keydown
          $el.on('keydown', function(e) {
            var allowed = [8, 9, 13, 27, 37, 38, 39, 40, 46, 110, 190];
            if (allowed.indexOf(e.keyCode) !== -1) {
              return;
            }
            // Allow digits
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
              return;
            }
            // Allow negative sign if enabled
            if (scope.allowNegative && (e.keyCode === 189 || e.keyCode === 109)) {
              return;
            }
            e.preventDefault();
          });

          // Format for display
          ngModelCtrl.$formatters.push(function(modelValue) {
            if (modelValue === null || modelValue === undefined || modelValue === '') {
              return '';
            }
            var num = parseFloat(modelValue);
            if (isNaN(num)) {
              return '';
            }
            return symbol + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          });

          // Parse for model
          ngModelCtrl.$parsers.push(function(viewValue) {
            if (!viewValue) {
              return 0;
            }
            var cleaned = viewValue.replace(/[^0-9.\-]/g, '');
            var num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
          });

          // Validator
          ngModelCtrl.$validators.validCurrency = function(modelValue) {
            if (modelValue === null || modelValue === undefined) {
              return true;
            }
            return !isNaN(modelValue) && isFinite(modelValue);
          };

          // Anti-pattern: manual cleanup of jQuery events
          scope.$on('$destroy', function() {
            $el.off('focus blur keydown');
          });
        }
      };
    }]);
})();
