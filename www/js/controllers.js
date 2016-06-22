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
  $scope.userId = 0;

  if(AuthService.isAuthenticated()) {
      $scope.loggedIn = true;
      $scope.username = AuthService.getUsername();
      $scope.userId = AuthService.getUserId();
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
    $location.path('/app');
  };

  $scope.logOut = function() {
    AuthService.logout();
    $scope.loggedIn = false;
    $scope.username = '';
    $scope.userId = 0;
    $location.path('/app');
  };
    
  $rootScope.$on('login:Successful', function () {
    $scope.loggedIn = AuthService.isAuthenticated();
    $scope.username = AuthService.getUsername();
    $scope.userId = AuthService.getUserId();
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
  };

  $rootScope.$on('register:Successful', function () {
      $localStorage.storeObject('userinfo',$scope.loginData);
      $scope.closeRegister();
      AuthService.login($scope.loginData);
  });
})

.controller('FriendsCtrl', function($scope, $http, $localStorage, baseURL, AuthService, $rootScope) {
  $scope.friends = [];
  $scope.loggedIn = AuthService.isAuthenticated();

  var loadFriends = function (){
      var req = { method: 'GET',
                  url: baseURL + '/users/' +  AuthService.getUserId() + '/friends',
                  headers: { 'x-access-token': AuthService.getTokenId() }
      }
      $http(req).then(
        function successCallback(response) {
        // this callback will be called asynchronously when the response is available
          $scope.friends = response.data;
          $scope.$broadcast('scroll.refreshComplete');
        }, function errorCallback(response) {
        // called asynchronously if an error occurs or server returns response with an error status.
          console.log('err response:' + JSON.stringify(response));
        });
  }

  if (AuthService.getUserId()){
      loadFriends();
  };

  $rootScope.$on('login:Successful', function () {
      loadFriends();
      $scope.loggedIn = true;
  });
  $rootScope.$on('logout:Successful', function () {
      $scope.friends = [];
      $scope.loggedIn = false;
  });

  $scope.doRefresh = function() {
    if ($scope.loggedIn){
      loadFriends();
    }
  }
})

.controller('UserCtrl', function($scope, $rootScope, $http, $stateParams, $ionicModal, $localStorage, $location, baseURL, AuthService) {
  $scope.newWeight = {comments : ''};
  $scope.loggedIn = AuthService.isAuthenticated();

  $rootScope.$on('login:Successful', function () {
    //console.log('Login call');
    $scope.loggedIn = true;
    loadProfile();
    loadWeights();
  });

  $rootScope.$on('logout:Successful', function () {
      $scope.loggedIn = false;
      $scope.user = {};
      $scope.weights = [];
      $scope.newWeight = {comments : ''};
  });

  $rootScope.$on('profile:update', function () {
    loadProfile();
  });


  var loadProfile = function (){
    //console.log('$stateParams.userId:' + $stateParams.userId);
    if (!$stateParams.userId || $stateParams.userId == 0){
      $stateParams.userId = AuthService.getUserId();
    }
    var req = { method: 'GET',
                url: baseURL + '/users/' +  $stateParams.userId + '/profile',
                headers: { 'x-access-token': AuthService.getTokenId() }
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
    if (!$stateParams.userId || $stateParams.userId == 0){
      $stateParams.userId = AuthService.getUserId();
    }
    var req = { method: 'GET',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights',
                headers: { 'x-access-token': AuthService.getTokenId() }
    }
    $http(req).then(
      function successCallback(response) {
        // this callback will be called asynchronously when the response is available
        for (var i = 0; i < response.data.length; i++) {
          response.data[i].date = new Date(response.data[i].date);
        }
        //console.log(response.data);
        $scope.weights = response.data;
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }

  $scope.addWeight = function(){
    if (!$stateParams.userId || $stateParams.userId == 0){
      $stateParams.userId = AuthService.getUserId();
    }
    var req = { method: 'POST',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights',
                headers: { 'x-access-token': AuthService.getTokenId() },
                data: {weight : $scope.newWeight.weight, comments : $scope.newWeight.comments}
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        for (var i = 0; i < response.data.length; i++) {
          response.data[i].date = new Date(response.data[i].date);
        }
        $scope.weights = response.data;
        $scope.newWeight = {comments : ''};
        loadProfile();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }

  $scope.deleteWeight = function(id) {
    //console.log('Deleting weight:' + id)
    if (!$stateParams.userId || $stateParams.userId == 0){
      $stateParams.userId = AuthService.getUserId();
    }
    var req = { method: 'DELETE',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights/' + id,
                headers: { 'x-access-token': AuthService.getTokenId }
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        loadProfile();
        loadWeights();
        $scope.closeWeight();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/weight.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeWeight = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.showWeightModal = function() {
    //console.log('$scope.weight:' + JSON.stringify($scope.weight));
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.updateWeight = function() {
    if (!$stateParams.userId || $stateParams.userId == 0){
      $stateParams.userId = AuthService.getUserId();
    }
    var req = { method: 'PUT',
                url: baseURL + '/users/' +  $stateParams.userId + '/weights/' + $scope.weight.id,
                headers: { 'x-access-token': AuthService.getTokenId },
                data: {date: $scope.weight.date , weight : $scope.weight.weight, reference : $scope.weight.reference, comments : $scope.weight.comments}
    }
    $http(req).then(
      function successCallback(response) {
      // this callback will be called asynchronously when the response is available
        loadProfile();
        loadWeights();
        $scope.closeWeight();
      }, function errorCallback(response) {
      // called asynchronously if an error occurs or server returns response with an error status.
        console.log('err response:' + JSON.stringify(response));
      });
  };


  $scope.onTap = function(id) {
    for (var i = 0; i < $scope.weights.length; i++) {
      if ($scope.weights[i].id == id){
        break;
      }
    }
    $scope.weight = $scope.weights[i];
    $scope.showWeightModal();
  }

  $scope.editProfile = function(id) {
    //console.log('Editing profile:' + '/app/profile/' + id);
    $location.path('/app/profile/' + id);
  }

  if(AuthService.isAuthenticated()){
    //console.log('Normal call');
    loadProfile();
    loadWeights();
  }

})

.controller('EditProfileCtrl', function($scope, $http, $stateParams, baseURL, AuthService, $rootScope, $ionicHistory) {
  $scope.user = [];

  var loadUserData = function (){
      var req = { method: 'GET',
                  url: baseURL + '/users/' +  $stateParams.userId,
                  headers: { 'x-access-token': AuthService.getTokenId() }
      }
      $http(req).then(
        function successCallback(response) {
          response.data.birthdate = new Date(response.data.birthdate);
          $scope.user = response.data;
        }, function errorCallback(response) {
          console.log('err response:' + JSON.stringify(response));
        });
  }

  $scope.updateUser = function(){
    var req = { method: 'PUT',
                url: baseURL + '/users/' +  $stateParams.userId,
                headers: { 'x-access-token': AuthService.getTokenId },
                data: {
                  male: $scope.user.male,
                  height: $scope.user.height,
                  birthdate: $scope.user.birthdate,
                  goal: $scope.user.goal}
    }
    $http(req).then(
      function successCallback(response) {
        $rootScope.$broadcast('profile:update');
        $ionicHistory.goBack();
      }, function errorCallback(response) {
        console.log('err response:' + JSON.stringify(response));
      });
  }

  loadUserData();
})
;