'use strict';

angular.module('angular-prototype', ['ui.router', 'ngMessages', 'satellizer'])
  .config(['$stateProvider', '$urlRouterProvider', '$authProvider', function($stateProvider, $urlRouterProvider, $authProvider){
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {url:'/', templateUrl:'/views/general/home.html'})
      .state('faq', {url:'/faq', templateUrl:'/views/general/faq.html'})
      .state('contact', {url:'/contact', templateUrl:'/views/general/contact.html'})

      .state('register', {url:'/register', templateUrl:'/views/users/users.html', controller:'UsersCtrl'})
      .state('login', {url:'/login', templateUrl:'/views/users/users.html', controller:'UsersCtrl'});

    $authProvider.github({clientId:'50289e41bad5edb68f66'});
    $authProvider.linkedin({clientId:'751i7hx0a5gd8m'});
    $authProvider.google({clientId:'508721962316-llobf3vaql8aelbfc3mi4ra48420fm95.apps.googleusercontent.com'});
    $authProvider.facebook({clientId:'346515052207722'});
    $authProvider.twitter({url: '/auth/twitter'});
  }])
  .run(['$rootScope', '$window', '$auth', function($rootScope, $window, $auth){
    if($auth.isAuthenticated()) {
      $rootScope.user = JSON.parse($window.localStorage.user);
    }
  }]);
