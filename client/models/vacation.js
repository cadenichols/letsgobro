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
      return $http.get(`/vacations/${vacationId}/flights`);
    }
    function purchaseFlight(vacation, info) {
      return $http.post(`/vacations/${vacation}/flights/purchase`, info);
    }
    
    return {create:create, show:show, index:index, getFlights:getFlights, purchaseFlight:purchaseFlight};
  }]);
