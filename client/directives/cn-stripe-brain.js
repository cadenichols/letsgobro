/* global StripeCheckout:true */
/* jshint quotmark:false */

'use strict';

angular.module('angular-prototype')
.directive('cnStripeBrain', [() => {
  let o = {};
  o.restrict = 'A';
  o.templateUrl = '/directives/cn-stripe-brain.html';
  o.scope = {};
  o.controller = ['$scope', '$rootScope', 'Vacation', ($scope, $rootScope, Vacation) => {
    let data;
    let handler = StripeCheckout.configure({
      key: 'pk_test_Juj6ciDALdGVzEBrCt1V05Rq',
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      token: function(token) {
        data.token = token.id;
        Vacation.purchaseFlight(data.vacation, data)
        .then(response => {
          $rootScope.$broadcast('flight-purchased', response.data);
        });
      }
    });
    $scope.$on('purchase', (event, info) => {
      data = info;
      handler.open({
        name: "Let's Go, Bro!",
        description: info.description,
        amount: info.cost
      });
    });
  }];
  return o;
}]);
