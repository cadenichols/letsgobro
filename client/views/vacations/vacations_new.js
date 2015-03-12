'use strict';

angular.module('angular-prototype')
  .controller('VacationsNewCtrl', ['$scope', '$state', 'Vacation', ($scope, $state, Vacation) => {
    $scope.moment = moment;
    $scope.submit = function(vacation) {
      Vacation.create(vacation)
      .then(response => {
        $state.go('vacations.show', {vacationId: response.data.vacationId});
      });
    };
  }]);
