/**
 * ExpenseController
 * Legacy AngularJS controller with $scope, $rootScope events,
 * $watch, jQuery DOM manipulation, Lodash, and Moment.js usage.
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .controller('ExpenseController', [
      '$scope', '$rootScope', '$timeout', '$filter', 'ExpenseService',
      function($scope, $rootScope, $timeout, $filter, ExpenseService) {

        // --- Legacy $scope state ---
        $scope.reports = [];
        $scope.filteredReports = [];
        $scope.selectedReport = null;
        $scope.isLoading = false;
        $scope.errorMessage = '';
        $scope.showNewReport = false;
        $scope.filterStatus = 'all';
        $scope.searchQuery = '';
        $scope.dateRange = { start: null, end: null };

        $scope.newReport = _getEmptyReport();
        $scope.newExpense = _getEmptyExpense();

        $scope.expenseCategories = [
          'Airfare', 'Hotel', 'Meals', 'Ground Transport',
          'Car Rental', 'Fuel', 'Parking', 'Tips',
          'Phone/Internet', 'Office Supplies', 'Entertainment', 'Other'
        ];

        $scope.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

        // --- Legacy: $watch for auto-totalling ---
        $scope.$watch('newReport.expenses', function(expenses) {
          if (expenses && expenses.length > 0) {
            $scope.newReport.totalAmount = _.sumBy(expenses, function(exp) {
              return parseFloat(exp.amount) || 0;
            });
            $scope.newReport.categoryBreakdown = _getCategoryBreakdown(expenses);
          }
        }, true);

        $scope.$watchGroup(['searchQuery', 'filterStatus'], function() {
          $scope.applyFilters();
        });

        $scope.$watch('dateRange', function(newVal) {
          if (newVal.start || newVal.end) {
            $scope.applyFilters();
          }
        }, true);

        // --- Legacy: jQuery datepicker ---
        $scope.initDatepickers = function() {
          $timeout(function() {
            $('#expenseDate').datepicker({
              maxDate: 0,
              dateFormat: 'mm/dd/yy',
              onSelect: function(dateText) {
                $scope.$apply(function() {
                  $scope.newExpense.date = new Date(dateText);
                });
              }
            });
            $('#reportStartDate, #reportEndDate').datepicker({
              dateFormat: 'mm/dd/yy'
            });
          }, 0);
        };

        // --- Load expense reports ---
        $scope.loadReports = function() {
          $scope.isLoading = true;
          $scope.errorMessage = '';

          ExpenseService.getReports().then(function(reports) {
            $scope.reports = reports;
            $scope.applyFilters();
            $scope.calculateDashboard();
          }).catch(function(err) {
            $scope.errorMessage = 'Failed to load expense reports.';
            $rootScope.$broadcast('notification:add', 'Failed to load expenses', 'error');
          }).finally(function() {
            $scope.isLoading = false;
          });
        };

        // --- Apply filters with Lodash ---
        $scope.applyFilters = function() {
          var filtered = _.clone($scope.reports);

          if ($scope.filterStatus !== 'all') {
            filtered = _.filter(filtered, { status: $scope.filterStatus });
          }

          if ($scope.searchQuery) {
            var query = $scope.searchQuery.toLowerCase();
            filtered = _.filter(filtered, function(report) {
              return report.title.toLowerCase().indexOf(query) > -1 ||
                     report.tripDestination.toLowerCase().indexOf(query) > -1;
            });
          }

          if ($scope.dateRange.start) {
            var start = moment($scope.dateRange.start);
            filtered = _.filter(filtered, function(report) {
              return moment(report.submittedAt).isSameOrAfter(start);
            });
          }

          if ($scope.dateRange.end) {
            var end = moment($scope.dateRange.end);
            filtered = _.filter(filtered, function(report) {
              return moment(report.submittedAt).isSameOrBefore(end);
            });
          }

          $scope.filteredReports = _.orderBy(filtered, ['submittedAt'], ['desc']);
        };

        // --- Dashboard calculations with Lodash ---
        $scope.calculateDashboard = function() {
          $scope.dashboard = {
            totalSubmitted: _.sumBy($scope.reports, 'totalAmount'),
            totalApproved: _.sumBy(_.filter($scope.reports, { status: 'approved' }), 'totalAmount'),
            totalPending: _.sumBy(_.filter($scope.reports, { status: 'pending' }), 'totalAmount'),
            totalRejected: _.sumBy(_.filter($scope.reports, { status: 'rejected' }), 'totalAmount'),
            reportCount: $scope.reports.length,
            avgAmount: $scope.reports.length > 0 ? _.meanBy($scope.reports, 'totalAmount') : 0,
            topCategory: _getTopCategory(),
            recentMonth: _getMonthlyTotal()
          };
        };

        // --- Toggle new report form ---
        $scope.toggleNewReport = function() {
          $scope.showNewReport = !$scope.showNewReport;
          $scope.newReport = _getEmptyReport();
          $scope.newExpense = _getEmptyExpense();

          if ($scope.showNewReport) {
            $timeout(function() {
              $('#new-expense-report').hide().slideDown(300);
              $scope.initDatepickers();
            }, 0);
          }
        };

        // --- Add expense line item ---
        $scope.addExpense = function() {
          if (!$scope.newExpense.description || !$scope.newExpense.amount) {
            // jQuery highlight (anti-pattern)
            $('.expense-required').addClass('has-error').delay(3000).queue(function() {
              $(this).removeClass('has-error').dequeue();
            });
            return;
          }

          var expense = angular.copy($scope.newExpense);
          expense.id = _.uniqueId('exp_');
          expense.dateFormatted = moment(expense.date).format('MMM D, YYYY');
          expense.amountFormatted = '$' + parseFloat(expense.amount).toFixed(2);

          $scope.newReport.expenses.push(expense);
          $scope.newExpense = _getEmptyExpense();

          $rootScope.$broadcast('notification:add', 'Expense item added', 'info');
        };

        // --- Remove expense line item ---
        $scope.removeExpense = function(index) {
          $scope.newReport.expenses.splice(index, 1);
        };

        // --- Submit expense report ---
        $scope.submitReport = function() {
          if (!$scope.newReport.title) {
            $scope.errorMessage = 'Report title is required.';
            return;
          }
          if ($scope.newReport.expenses.length === 0) {
            $scope.errorMessage = 'Add at least one expense item.';
            return;
          }

          $scope.isLoading = true;
          $scope.errorMessage = '';

          var reportData = angular.copy($scope.newReport);
          reportData.submittedAt = moment().toISOString();
          reportData.submittedBy = $rootScope.currentUser ? $rootScope.currentUser.name : 'Demo User';

          // Format expense dates
          reportData.expenses = _.map(reportData.expenses, function(exp) {
            exp.date = moment(exp.date).format('YYYY-MM-DD');
            return exp;
          });

          ExpenseService.submitReport(reportData).then(function(result) {
            $rootScope.$broadcast('notification:add', 'Expense report submitted successfully!', 'success');
            $scope.showNewReport = false;
            $scope.newReport = _getEmptyReport();
            $scope.loadReports();
          }).catch(function(err) {
            $scope.errorMessage = 'Failed to submit expense report.';
            $rootScope.$broadcast('notification:add', 'Expense submission failed', 'error');
          }).finally(function() {
            $scope.isLoading = false;
          });
        };

        // --- View report details ---
        $scope.viewReport = function(report) {
          $scope.selectedReport = report;
          $scope.isLoading = true;

          ExpenseService.getReportDetails(report.id).then(function(details) {
            $scope.selectedReport = details;
            // jQuery modal (anti-pattern)
            $('#expenseDetailModal').modal('show');
          }).catch(function() {
            $scope.errorMessage = 'Failed to load report details.';
          }).finally(function() {
            $scope.isLoading = false;
          });
        };

        // --- Delete report ---
        $scope.deleteReport = function(report) {
          if (!confirm('Are you sure you want to delete this expense report?')) return;

          ExpenseService.deleteReport(report.id).then(function() {
            _.remove($scope.reports, { id: report.id });
            $scope.applyFilters();
            $scope.calculateDashboard();
            $rootScope.$broadcast('notification:add', 'Expense report deleted', 'warning');
          }).catch(function() {
            $rootScope.$broadcast('notification:add', 'Failed to delete report', 'error');
          });
        };

        // --- Upload receipt (jQuery file input) ---
        $scope.uploadReceipt = function() {
          // jQuery file input trigger (anti-pattern)
          $('#receiptFileInput').trigger('click');
        };

        $scope.onReceiptSelected = function(files) {
          if (files && files.length > 0) {
            var file = files[0];
            $scope.newExpense.receipt = file;
            $scope.newExpense.receiptName = file.name;
            $scope.$apply();
          }
        };

        // --- Format helpers ---
        $scope.formatDate = function(date) {
          return moment(date).format('MMM D, YYYY');
        };

        $scope.formatCurrency = function(amount) {
          return $filter('currency')(amount, '$', 2);
        };

        $scope.getStatusClass = function(status) {
          switch (status) {
            case 'approved': return 'label-success';
            case 'pending': return 'label-warning';
            case 'rejected': return 'label-danger';
            case 'draft': return 'label-default';
            default: return 'label-info';
          }
        };

        // --- Private helpers ---
        function _getEmptyReport() {
          return {
            title: '',
            tripDestination: '',
            travelRequestId: '',
            expenses: [],
            totalAmount: 0,
            categoryBreakdown: {},
            notes: ''
          };
        }

        function _getEmptyExpense() {
          return {
            date: new Date(),
            category: '',
            description: '',
            amount: null,
            currency: 'USD',
            receipt: null,
            receiptName: '',
            notes: ''
          };
        }

        function _getCategoryBreakdown(expenses) {
          return _.mapValues(_.groupBy(expenses, 'category'), function(items) {
            return _.sumBy(items, function(i) { return parseFloat(i.amount) || 0; });
          });
        }

        function _getTopCategory() {
          var allExpenses = _.flatMap($scope.reports, 'expenses');
          if (allExpenses.length === 0) return 'N/A';
          var grouped = _.groupBy(allExpenses, 'category');
          var totals = _.mapValues(grouped, function(items) {
            return _.sumBy(items, function(i) { return parseFloat(i.amount) || 0; });
          });
          return _.maxBy(_.keys(totals), function(cat) { return totals[cat]; }) || 'N/A';
        }

        function _getMonthlyTotal() {
          var thisMonth = moment().startOf('month');
          var monthReports = _.filter($scope.reports, function(r) {
            return moment(r.submittedAt).isSameOrAfter(thisMonth);
          });
          return _.sumBy(monthReports, 'totalAmount') || 0;
        }

        // --- Listen for $rootScope events ---
        var deregLogin = $rootScope.$on('auth:login', function() {
          $scope.loadReports();
        });

        $scope.$on('$destroy', function() {
          deregLogin();
        });

        // --- Initialise ---
        $scope.loadReports();
      }
    ]);
})();
