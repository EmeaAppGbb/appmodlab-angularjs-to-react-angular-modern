/**
 * GlobalTravel Corp - Approval Status Directive
 * Legacy pattern: Displays status badges with jQuery animations.
 * Anti-patterns:
 *   - jQuery for DOM manipulation and animations
 *   - Manual template construction via string concatenation
 *   - Direct element manipulation instead of Angular templates
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .directive('gtApprovalStatus', ['$timeout', function($timeout) {
      return {
        restrict: 'E',
        scope: {
          status: '=',
          showIcon: '=?',
          animate: '=?',
          size: '@'
        },
        link: function(scope, element, attrs) {
          var $el = $(element);
          var sizeClass = scope.size === 'lg' ? 'badge-lg' : (scope.size === 'sm' ? 'badge-sm' : '');

          var statusConfig = {
            pending: {
              label: 'Pending',
              cssClass: 'label-warning',
              icon: 'glyphicon-hourglass'
            },
            approved: {
              label: 'Approved',
              cssClass: 'label-success',
              icon: 'glyphicon-ok-circle'
            },
            rejected: {
              label: 'Rejected',
              cssClass: 'label-danger',
              icon: 'glyphicon-remove-circle'
            },
            cancelled: {
              label: 'Cancelled',
              cssClass: 'label-default',
              icon: 'glyphicon-ban-circle'
            },
            draft: {
              label: 'Draft',
              cssClass: 'label-info',
              icon: 'glyphicon-edit'
            },
            confirmed: {
              label: 'Confirmed',
              cssClass: 'label-success',
              icon: 'glyphicon-ok'
            },
            'in-review': {
              label: 'In Review',
              cssClass: 'label-primary',
              icon: 'glyphicon-eye-open'
            }
          };

          function renderBadge(status) {
            var config = statusConfig[status] || {
              label: status || 'Unknown',
              cssClass: 'label-default',
              icon: 'glyphicon-question-sign'
            };

            // Anti-pattern: building HTML via string concatenation
            var html = '<span class="label ' + config.cssClass + ' gt-status-badge ' + sizeClass + '">';
            if (scope.showIcon !== false) {
              html += '<span class="glyphicon ' + config.icon + '"></span> ';
            }
            html += config.label;
            html += '</span>';

            // Anti-pattern: jQuery DOM manipulation
            $el.html(html);

            // Anti-pattern: jQuery animations for status display
            if (scope.animate !== false) {
              $el.find('.gt-status-badge').hide().fadeIn(300);
            }
          }

          // Anti-pattern: deep watch triggers re-render with jQuery animation
          scope.$watch('status', function(newVal, oldVal) {
            if (newVal !== oldVal && oldVal) {
              // Animate transition between statuses
              $el.find('.gt-status-badge').fadeOut(200, function() {
                renderBadge(newVal);
                // Anti-pattern: jQuery pulse animation for status change
                $el.find('.gt-status-badge')
                  .css('transform', 'scale(1.2)')
                  .animate({ dummy: 1 }, {
                    duration: 300,
                    step: function(now) {
                      $(this).css('transform', 'scale(' + (1.2 - (0.2 * now)) + ')');
                    },
                    complete: function() {
                      $(this).css('transform', 'scale(1)');
                    }
                  });
              });
            } else {
              renderBadge(newVal);
            }
          });

          // Initial render
          renderBadge(scope.status);

          // Anti-pattern: jQuery tooltip initialization
          $timeout(function() {
            $el.find('.gt-status-badge').tooltip({
              title: 'Status: ' + (scope.status || 'Unknown'),
              placement: 'top',
              trigger: 'hover'
            });
          }, 100);

          scope.$on('$destroy', function() {
            $el.find('.gt-status-badge').tooltip('destroy');
          });
        }
      };
    }]);
})();
