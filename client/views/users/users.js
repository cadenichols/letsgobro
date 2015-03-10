'use strict';

angular.module('angular-prototype')
  .controller('UsersCtrl', ['$rootScope', '$scope', '$state', '$auth', 'User', function($rootScope, $scope, $state, $auth, User){
    $scope.name = _.capitalize($state.current.name);

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
    };

    $scope.submit = function(user){
      if($scope.name === 'Register'){
        if((user.password1 === user.password2) && (user.email)){
          User.register({email:user.email, password:user.password1}).then(function(){
            $state.go('login');
          }, function(){
            user.email = user.password1 = user.password2 = '';
          });
        }else{
          user.password1 = user.password2 = '';
        }
      }else{
        User.login(user).then(function(response){
          $rootScope.email = response.data.email;
          $state.go('home');
        }, function(){
          user.email = user.password = '';
        });
      }
    };
  }]);
