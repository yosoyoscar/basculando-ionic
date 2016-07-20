angular.module('basculando.friends', [])

.controller('FriendsCtrl', function($scope, $http, $localStorage, baseURL, AuthService, $rootScope, $location, $ionicPopup) {
  $scope.myFriends   = [];
  $scope.seeingMe    = [];
  $scope.numPendings = 0;
  $scope.loggedIn    = AuthService.isAuthenticated();

  var loadFriends = function (){
      var req = { method: 'GET', url: baseURL + '/users/' +  AuthService.getUserId() + '/friends' }
      $http(req).then(
        function successCallback(response) {
          $scope.myFriends = response.data;
          for (var i = 0; i < $scope.myFriends.length; i++) {
            $scope.myFriends[i].weight = Number($scope.myFriends[i].weight);
            $scope.myFriends[i].goal = Number($scope.myFriends[i].goal);
          }
          console.log($scope.myFriends);
          req = { method: 'GET', url: baseURL + '/users/' +  AuthService.getUserId() + '/whoisconnectedtome' }
          $http(req).then(
            function successCallback(response) {
              $scope.seeingMe = response.data;
              for (var i=0; i<response.data.length; i++){
                if (response.data[i].pending){
                  $scope.numPendings++;
                }
              }
              $scope.$broadcast('scroll.refreshComplete');
            }, function errorCallback(response) {
              console.log('err response:' + JSON.stringify(response));
            });
        }, function errorCallback(response) {
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
      $scope.myFriends = [];
      $scope.seeingMe = [];
      $scope.numPendings = 0;
      $scope.loggedIn = false;
  });

  $scope.doRefresh = function() {
    if ($scope.loggedIn){
      loadFriends();
    }
  }

  $scope.deleteFriend = function(id, username){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Are you sure?',
      template: username + ' is not my friend any more!'
    });

    confirmPopup.then(function(res) {
      if(res) {
        var req = { method: 'DELETE', url: baseURL + '/users/' +  AuthService.getUserId() + '/link/' + id }
        $http(req).then(
          function successCallback(response) {
            loadFriends();
          }, function errorCallback(response) {
            console.log('AddFriendCtrl.onTap err response:' + JSON.stringify(response));
          });
      }
    });

  }

  $scope.addFriend = function() {
    $location.path('/app/addFriend');
  }

  $scope.accept = function(id, write){
    var req = { method: 'PUT', url: baseURL + '/users/' +  AuthService.getUserId() + '/acceptfriendship/' + id, data: {"write":write} }
    $http(req).then(
      function successCallback(response) {
        $scope.seeingMe = response.data;
        updateConts();
      }, function errorCallback(response) {
        console.log('err response:' + JSON.stringify(response));
      });
  }

  $scope.deny = function(id, username){
    var req = { method: 'PUT', url: baseURL + '/users/' +  AuthService.getUserId() + '/denyfriendship/' + id }
    $http(req).then(
      function successCallback(response) {
        $scope.seeingMe = response.data;
        updateConts();
        var alertPopup = $ionicPopup.alert({
          title: '<h4>Deleted!</h4>',
          template: username + ' can\'t see you anymore!'
        });
      }, function errorCallback(response) {
        console.log('err response:' + JSON.stringify(response));
      });
  }

  var updateConts = function(){
    $scope.numPendings = 0;
    for (var i=0; i<$scope.seeingMe.length; i++){
      if ($scope.seeingMe[i].pending){
        $scope.numPendings++;
      }
    }
  }
})

;