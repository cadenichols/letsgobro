'use strict';

angular.module('angular-prototype')
  .factory('Vacation', ['$http', function($http){

    function create(vacation){
      return $http.post('/vacations', vacation);
    }
    function show(vacationId) {
      return $http.get('/vacations/' + vacationId);
    }
    function index() {
      return $http.get('/vacations');
    }
    function getFlights(vacationId) {
      return $http.get('/flights/' + vacationId);
    }
    
    return {create:create, show:show, index:index, getFlights:getFlights};
  }]);
