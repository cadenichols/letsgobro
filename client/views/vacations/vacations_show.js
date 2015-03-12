'use strict';

angular.module('angular-prototype')
  .controller('VacationsShowCtrl', ['$scope', '$state', 'Vacation', ($scope, $state, Vacation) => {
    Vacation.show($state.params.vacationId)
    .then(response => {
      $scope.vacation = response.data.vacation;
    });
    $scope.submit = () => {
      Vacation.getFlights($state.params.vacationId)
      .then(response => {
        $scope.flights = response.data;
      });
    };
  }]);
