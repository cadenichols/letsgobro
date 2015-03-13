'use strict';

angular.module('angular-prototype')
  .controller('VacationsShowCtrl', ['$scope', '$state', 'Vacation', ($scope, $state, Vacation) => {
    Vacation.show($state.params.vacationId)
    .then(response => {
      $scope.vacation = response.data.vacation;
    });

    $scope.$on('flight-purchased', (event, vacation) => {
      console.log('vacation_show.js. vacation:', vacation);
      $scope.vacation = vacation;
    });

    $scope.submit = () => {
      Vacation.getFlights($state.params.vacationId)
      .then(response => {
        $scope.itineraries = response.data;
      });
    };
  }]);
