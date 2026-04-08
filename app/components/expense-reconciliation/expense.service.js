/**
 * ExpenseService
 * Uses Restangular for API calls with Lodash and Moment.js transformations.
 */
(function() {
  'use strict';

  angular.module('globalTravelApp')
    .service('ExpenseService', ['Restangular', '$q', function(Restangular, $q) {

      var reportsEndpoint = Restangular.all('expense-reports');

      /**
       * Get all expense reports
       * @returns {Promise<Array>}
       */
      this.getReports = function() {
        return reportsEndpoint.getList().then(function(reports) {
          return _.map(reports, function(report) {
            report.submittedFormatted = moment(report.submittedAt).format('MMM D, YYYY');
            report.totalFormatted = '$' + (report.totalAmount || 0).toFixed(2);
            report.expenseCount = report.expenses ? report.expenses.length : 0;
            report.daysSinceSubmission = moment().diff(moment(report.submittedAt), 'days');
            return report;
          });
        });
      };

      /**
       * Get expense report details
       * @param {string} reportId
       * @returns {Promise}
       */
      this.getReportDetails = function(reportId) {
        return Restangular.one('expense-reports', reportId).get().then(function(report) {
          report.expenses = _.map(report.expenses, function(exp) {
            exp.dateFormatted = moment(exp.date).format('MMM D, YYYY');
            exp.amountFormatted = '$' + parseFloat(exp.amount).toFixed(2);
            return exp;
          });
          report.categoryTotals = _.mapValues(_.groupBy(report.expenses, 'category'), function(items) {
            return _.sumBy(items, function(i) { return parseFloat(i.amount) || 0; });
          });
          return report;
        });
      };

      /**
       * Submit a new expense report
       * @param {Object} reportData
       * @returns {Promise}
       */
      this.submitReport = function(reportData) {
        return reportsEndpoint.post(reportData);
      };

      /**
       * Update an existing expense report
       * @param {string} reportId
       * @param {Object} reportData
       * @returns {Promise}
       */
      this.updateReport = function(reportId, reportData) {
        return Restangular.one('expense-reports', reportId).customPUT(reportData);
      };

      /**
       * Delete an expense report
       * @param {string} reportId
       * @returns {Promise}
       */
      this.deleteReport = function(reportId) {
        return Restangular.one('expense-reports', reportId).remove();
      };

      /**
       * Upload receipt for an expense
       * @param {string} expenseId
       * @param {File} file
       * @returns {Promise}
       */
      this.uploadReceipt = function(expenseId, file) {
        var formData = new FormData();
        formData.append('receipt', file);
        return Restangular.one('expenses', expenseId).withHttpConfig({
          transformRequest: angular.identity
        }).customPOST(formData, 'receipt', undefined, {
          'Content-Type': undefined
        });
      };

      /**
       * Get expense statistics
       * @param {Object} params - date range, etc.
       * @returns {Promise}
       */
      this.getStatistics = function(params) {
        return Restangular.one('expense-reports', 'statistics').get(params);
      };

      /**
       * Link expense report to a travel request
       * @param {string} reportId
       * @param {string} travelRequestId
       * @returns {Promise}
       */
      this.linkToTravelRequest = function(reportId, travelRequestId) {
        return Restangular.one('expense-reports', reportId).customPUT({
          travelRequestId: travelRequestId
        });
      };
    }]);
})();
