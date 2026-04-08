/**
 * GlobalTravel Corp - FlightSearchController Tests
 * Sample Jasmine tests for AngularJS 1.6.x
 * Anti-patterns:
 *   - Testing $scope-based controller (legacy pattern)
 *   - Manual $httpBackend / Restangular mock setup
 *   - Testing implementation details rather than behavior
 */
'use strict';

describe('FlightSearchController', function() {
  var $controller, $rootScope, $scope, $httpBackend, Restangular;

  beforeEach(module('globalTravelApp'));

  beforeEach(inject(function(_$controller_, _$rootScope_, _$httpBackend_, _Restangular_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    Restangular = _Restangular_;

    // Mock the auth token
    localStorage.setItem('authToken', 'mock-jwt-token');

    // Default request expectations
    $httpBackend.whenGET(/\/api\/flights\/popular/).respond(200, [
      { origin: 'SFO', destination: 'JFK', avgPrice: 350 },
      { origin: 'LAX', destination: 'ORD', avgPrice: 280 }
    ]);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    localStorage.removeItem('authToken');
  });

  function createController() {
    var ctrl = $controller('FlightSearchController', {
      $scope: $scope,
      $rootScope: $rootScope
    });
    return ctrl;
  }

  describe('Initialization', function() {
    it('should initialize with default search params', function() {
      createController();
      $httpBackend.flush();

      expect($scope.searchParams).toBeDefined();
      expect($scope.searchParams.cabinClass).toBe('economy');
      expect($scope.searchParams.origin).toBe('');
      expect($scope.searchParams.destination).toBe('');
    });

    it('should initialize with empty results', function() {
      createController();
      $httpBackend.flush();

      expect($scope.flights).toBeDefined();
      expect($scope.flights.length).toBe(0);
    });

    it('should set loading to false after init', function() {
      createController();
      $httpBackend.flush();

      expect($scope.isLoading).toBe(false);
    });

    it('should load popular routes on init', function() {
      createController();
      $httpBackend.flush();

      expect($scope.popularRoutes).toBeDefined();
      expect($scope.popularRoutes.length).toBe(2);
    });
  });

  describe('Search Flights', function() {
    var mockFlights;

    beforeEach(function() {
      mockFlights = [
        {
          id: 'f1',
          airline: 'United Airlines',
          origin: 'SFO',
          destination: 'JFK',
          departureTime: '08:30',
          arrivalTime: '17:00',
          durationMinutes: 330,
          stops: 1,
          price: 450.00,
          cabinClass: 'economy'
        },
        {
          id: 'f2',
          airline: 'Delta Air Lines',
          origin: 'SFO',
          destination: 'JFK',
          departureTime: '10:00',
          arrivalTime: '18:15',
          durationMinutes: 315,
          stops: 0,
          price: 520.00,
          cabinClass: 'economy'
        },
        {
          id: 'f3',
          airline: 'American Airlines',
          origin: 'SFO',
          destination: 'JFK',
          departureTime: '14:30',
          arrivalTime: '23:00',
          durationMinutes: 330,
          stops: 1,
          price: 380.00,
          cabinClass: 'economy'
        }
      ];
    });

    it('should validate required fields before searching', function() {
      createController();
      $httpBackend.flush();

      $scope.searchParams.origin = '';
      $scope.searchParams.destination = '';

      $scope.searchFlights();

      expect($scope.errorMessage).toBeDefined();
      expect($scope.errorMessage).toContain('origin');
    });

    it('should search for flights with valid params', function() {
      $httpBackend.expectPOST(/\/api\/flights/).respond(200, mockFlights);

      createController();
      $httpBackend.flush();

      $scope.searchParams.origin = 'SFO';
      $scope.searchParams.destination = 'JFK';
      $scope.searchParams.departDate = new Date('2024-04-15');

      $scope.searchFlights();
      expect($scope.isLoading).toBe(true);

      $httpBackend.flush();

      expect($scope.flights.length).toBe(3);
      expect($scope.isLoading).toBe(false);
    });

    it('should handle search errors gracefully', function() {
      $httpBackend.expectPOST(/\/api\/flights/).respond(500, { error: 'Server error' });

      createController();
      $httpBackend.flush();

      $scope.searchParams.origin = 'SFO';
      $scope.searchParams.destination = 'JFK';
      $scope.searchParams.departDate = new Date('2024-04-15');

      $scope.searchFlights();
      $httpBackend.flush();

      expect($scope.errorMessage).toBeDefined();
      expect($scope.isLoading).toBe(false);
    });
  });

  describe('Filters', function() {
    it('should filter by airline', function() {
      createController();
      $httpBackend.flush();

      $scope.flights = [
        { airline: 'United Airlines', price: 450, stops: 1 },
        { airline: 'Delta Air Lines', price: 520, stops: 0 },
        { airline: 'United Airlines', price: 380, stops: 1 }
      ];
      $scope.filteredFlights = $scope.flights.slice();
      $scope.filters = { airlines: ['United Airlines'], stops: null, priceRange: { min: 0, max: 1000 } };

      $scope.applyFilters();

      expect($scope.filteredFlights.length).toBe(2);
      expect($scope.filteredFlights[0].airline).toBe('United Airlines');
    });

    it('should filter by number of stops', function() {
      createController();
      $httpBackend.flush();

      $scope.flights = [
        { airline: 'United Airlines', price: 450, stops: 1 },
        { airline: 'Delta Air Lines', price: 520, stops: 0 },
        { airline: 'American Airlines', price: 380, stops: 2 }
      ];
      $scope.filteredFlights = $scope.flights.slice();
      $scope.filters = { airlines: [], stops: 0, priceRange: { min: 0, max: 1000 } };

      $scope.applyFilters();

      expect($scope.filteredFlights.length).toBe(1);
      expect($scope.filteredFlights[0].stops).toBe(0);
    });
  });

  describe('Sorting', function() {
    it('should sort flights by price', function() {
      createController();
      $httpBackend.flush();

      $scope.flights = [
        { price: 520, airline: 'Delta' },
        { price: 380, airline: 'American' },
        { price: 450, airline: 'United' }
      ];

      $scope.sortField = 'price';
      $scope.sortReverse = false;
      $scope.applyFilters();

      expect($scope.filteredFlights[0].price).toBe(380);
      expect($scope.filteredFlights[2].price).toBe(520);
    });
  });

  describe('Flight Selection', function() {
    it('should select a flight and broadcast event', function() {
      createController();
      $httpBackend.flush();

      var flight = { id: 'f1', airline: 'United', price: 450 };
      spyOn($rootScope, '$broadcast');

      $scope.selectFlight(flight);

      expect($scope.selectedFlight).toBe(flight);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('flight:selected', flight);
    });
  });
});
