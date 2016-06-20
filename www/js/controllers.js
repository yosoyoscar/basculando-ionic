angular.module('starter.controllers', [])

//.constant('baseURL', 'https://weight-control.herokuapp.com')
//.constant('baseURL', 'http://localhost:5000')

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $localStorage, AuthService, baseURL, $rootScope, $location) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo','{}');
  $scope.registration = {username: '', password: '', male: true};
  $scope.loggedIn = false;

  if(AuthService.isAuthenticated()) {
      $scope.loggedIn = true;
      $scope.username = AuthService.getUsername();
  }
  else if ($scope.loginData && $scope.loginData.username && $scope.loginData.password){
      AuthService.login($scope.loginData);
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    //console.log('Doing login', $scope.loginData);
    $localStorage.storeObject('userinfo',$scope.loginData);
    AuthService.login($scope.loginData);
    $scope.closeLogin();
  };

  $scope.logOut = function() {
    AuthService.logout();
    $scope.loggedIn = false;
    $scope.username = '';
    $location.path('/app');
  };
    
  $rootScope.$on('login:Successful', function () {
    $scope.loggedIn = AuthService.isAuthenticated();
    $scope.username = AuthService.getUsername();
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.registerform = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeRegister = function () {
      $scope.registerform.hide();
  };

  // Open the login modal
  $scope.register = function () {
      $scope.registerform.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doRegister = function () {
      console.log('Doing registration', $scope.registration);
      $scope.loginData.username = $scope.registration.username;
      $scope.loginData.password = $scope.registration.password;

      AuthService.register($scope.registration);
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
          $scope.closeRegister();
      }, 1000);
  };

  $rootScope.$on('registration:Successful', function () {
      $localStorage.storeObject('userinfo',$scope.loginData);
  });
})

.controller('UsersCtrl', function($scope, $http, $localStorage, baseURL, AuthService, $rootScope) {
  $scope.users = [];

  $http.get(baseURL).then(
    function successCallback(response) {
    // this callback will be called asynchronously when the response is available
      $scope.wc = response.data;
    }, function errorCallback(response) {
    // called asynchronously if an error occurs or server returns response with an error status.
      console.log('err response:' + JSON.stringify(response));
    });

  var loadUsers = function (){
      var req = { method: 'GET',
                  url: baseURL + '/users/' +  AuthService.getUsernameId() + '/users',
                  headers: { 'x-access-token': AuthService.getTokenId }
      }
      $http(req).then(
        function successCallback(response) {
        // this callback will be called asynchronously when the response is available
          $scope.users = response.data;
          $scope.$broadcast('scroll.refreshComplete');
        }, function errorCallback(response) {
        // called asynchronously if an error occurs or server returns response with an error status.
          console.log('err response:' + JSON.stringify(response));
        });
  }

  if (AuthService.getUsernameId()){
      loadChildren();
  };

  $rootScope.$on('login:Successful', function () {
      loadUsers();
  });
  $rootScope.$on('logout:Successful', function () {
      $scope.users = [];
  });

  $scope.doRefresh = function() {
    loadUsers();
  }
})

.controller('UserCtrl', function($scope, $http, $stateParams, $localStorage, baseURL, AuthService) {
  $scope.newWeight = {weight : 0, comments : ''};
  var loadProfile = function (){
    var req = { method: 'GET',
                url: baseURL + '/users/' +  $stateParams.userId + '/profile',
                headers: { 'x-access-token': AuthService.getTokenId }
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        $scope.user = response.data;
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }

  var loadWeights = function(){
    var req = { method: 'GET',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights',
                headers: { 'x-access-token': AuthService.getTokenId }
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        $scope.weights = response.data;
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }

  loadProfile();
  loadWeights();

  $scope.addWeight = function(){
    console.log('New weight:' + JSON.stringify($scope.newWeight));
    var req = { method: 'POST',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights',
                headers: { 'x-access-token': AuthService.getTokenId },
                data: {weight : $scope.newWeight.weight, comments : $scope.newWeight.comments}
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        $scope.weights = response.data;
        loadProfile();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }

  $scope.deleteWeight = function(id) {
    console.log('Deleting weight:' + id)
    var req = { method: 'DELETE',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights/' + id,
                headers: { 'x-access-token': AuthService.getTokenId }
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        loadProfile();
        loadWeights();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }
  $scope.onHold = function(id) {
    //console.log('Holding:' + id)
    for (var i = 0; i < $scope.weights.length; i++) {
      if ($scope.weights[i].id == id){
        break;
      }
    }
    //console.log('$scope.weights:' + JSON.stringify($scope.weights));
    //console.log('Index:' + i);
    var req = { method: 'PUT',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights/' + id,
                headers: { 'x-access-token': AuthService.getTokenId },
                data: {date: $scope.weights[i].date , weight : $scope.weights[i].weight, reference : !$scope.weights[i].reference}
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        loadProfile();
        loadWeights();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }
});
