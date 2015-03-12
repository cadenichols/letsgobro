'use strict';

angular.module('angular-prototype')
  .controller('VacationsIndexCtrl', ['$scope', '$state', 'Vacation', ($scope, $state, Vacation) => {
    Vacation.index()
    .then(response => {
      $scope.vacations = response.data.vacations;
    });
    $scope.show = (vacationId) => {
      $state.go('vacations.show', {vacationId:vacationId});
    };
  }]);
