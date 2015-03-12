'use strict';

angular.module('angular-prototype')
.directive('cnStripe', [() => {
  let o = {};
  o.restrict = 'A';
  o.templateUrl = '/directives/cn-stripe.html';
  o.scope = {
    vacation:'=',
    cost:'=',
    description:'=',
    itinerary:'='
  };
  o.controller = ['$scope', '$rootScope', ($scope, $rootScope) => {
    $scope.purchase = () => {
      let info = {
        vacation: $scope.vacation,
        cost: $scope.cost * 100,
        description: $scope.description,
        itinerary: $scope.itinerary
      };
      console.log('STRIPE INFO:', info);
      $rootScope.$broadcast('purchase', info);
    };
  }];
  return o;
}]);
