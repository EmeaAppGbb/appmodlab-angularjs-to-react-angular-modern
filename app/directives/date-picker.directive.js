/**
 * GlobalTravel Corp - Date Picker Directive
 * Legacy pattern: Wraps jQuery UI Datepicker inside an AngularJS directive.
 * Anti-patterns:
 *   - Direct jQuery DOM manipulation inside Angular
 *   - Manual $apply() to sync jQuery events with Angular digest cycle
 *   - No Angular-native date handling
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .directive('gtDatePicker', ['$timeout', function($timeout) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          minDate: '=?',
          maxDate: '=?',
          dateFormat: '@',
          onDateChange: '&?'
        },
        link: function(scope, element, attrs, ngModelCtrl) {
          var format = scope.dateFormat || 'mm/dd/yy';

          // Anti-pattern: jQuery plugin initialization inside Angular directive
          var $el = $(element);

          $el.datepicker({
            dateFormat: format,
            changeMonth: true,
            changeYear: true,
            showAnim: 'fadeIn',
            beforeShow: function(input, inst) {
              // Anti-pattern: jQuery CSS manipulation
              $timeout(function() {
                $('#ui-datepicker-div').css('z-index', 9999);
              });
            },
            onSelect: function(dateText) {
              // Anti-pattern: manual $apply to bridge jQuery event into Angular digest
              scope.$apply(function() {
                var parsedDate = new Date(dateText);
                ngModelCtrl.$setViewValue(parsedDate);
                ngModelCtrl.$render();

                if (scope.onDateChange) {
                  scope.onDateChange({ date: parsedDate });
                }
              });
            }
          });

          // Anti-pattern: watch for external changes and manually update jQuery widget
          scope.$watch('minDate', function(newVal) {
            if (newVal) {
              $el.datepicker('option', 'minDate', new Date(newVal));
            }
          });

          scope.$watch('maxDate', function(newVal) {
            if (newVal) {
              $el.datepicker('option', 'maxDate', new Date(newVal));
            }
          });

          // Format model value for display
          ngModelCtrl.$formatters.push(function(modelValue) {
            if (modelValue) {
              return $.datepicker.formatDate(format, new Date(modelValue));
            }
            return '';
          });

          // Parse display value back to model
          ngModelCtrl.$parsers.push(function(viewValue) {
            if (viewValue) {
              try {
                return $.datepicker.parseDate(format, viewValue);
              } catch (e) {
                return undefined;
              }
            }
            return null;
          });

          // Anti-pattern: manual cleanup of jQuery plugin on scope destroy
          scope.$on('$destroy', function() {
            $el.datepicker('destroy');
          });

          // Anti-pattern: jQuery addClass for styling
          $el.addClass('gt-datepicker-input');
          $el.attr('placeholder', attrs.placeholder || 'Select date...');
        }
      };
    }]);
})();
