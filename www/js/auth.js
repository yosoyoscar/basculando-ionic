'use strict';

angular
  .module('starter.services',[])
  //.constant('baseURL', 'https://basculando.herokuapp.com')
  .constant('baseURL', 'http://localhost:5000')

  .factory('AuthService', ['$q', '$rootScope', '$ionicPopup', '$http', 'baseURL', '$localStorage',
    function($q, $rootScope, $ionicPopup, $http, baseURL, $localStorage) {
    function login(loginData) {
      //console.log('AuthService-login-psychoreg-log-Doing login:' + JSON.stringify(loginData));
      $http.post(baseURL + '/users/login', loginData).then(
        function successCallback(response) {
        // this callback will be called asynchronously when the response is available
          //console.log(response);
          $rootScope.currentUser = {
              id: response.data.id,
              tokenId: response.data.tokenId,
              username: loginData.username
            };
          $http.defaults.headers.common['x-access-token'] = response.data.tokenId;
          $rootScope.$broadcast('login:Successful');
          //console.log('Login Successful:' + JSON.stringify($rootScope.currentUser));
        }, function errorCallback(response) {
        // called asynchronously if an error occurs or server returns response with an error status.
          var message = '<div><p>' +  response.status + '</p><p>' + response.data.reason + '</p></div>';
          var alertPopup = $ionicPopup.alert({
            title: '<h4>Login Failed!</h4>',
            template: message
          });

          alertPopup.then(function(res) {
            console.log('Login Failed!');
          });
        });
    }

    function isAuthenticated() {
      if ($rootScope.currentUser) {
        return true;
      }
      else{
        return false;
      }
    }

    function getUsername() {
      return $rootScope.currentUser.username;
    }

    function getUserId() {
      //console.log('$rootScope.currentUser:' + JSON.stringify($rootScope.currentUser));
      if($rootScope.currentUser){
        return $rootScope.currentUser.id;
      }
      else{
        return null;
      }
    }

    function getTokenId() {
      //console.log('$rootScope.currentUser:' + JSON.stringify($rootScope.currentUser));
      if($rootScope.currentUser){
        return $rootScope.currentUser.tokenId;
      }
      else{
        return null;
      }
    }

    function logout() {
      $rootScope.currentUser = null;
      $http.defaults.headers.common['x-access-token'] = undefined;
      $localStorage.remove('userinfo');
      $rootScope.$broadcast('logout:Successful');
    }

    function register(registerData) {
      //console.log('baseURL:' + baseURL);
      $http.post(baseURL + '/users/register', registerData).then(
        function successCallback(response) {
        // this callback will be called asynchronously when the response is available
          //console.log('register response:' + JSON.stringify(response));
          $rootScope.currentUser = {
              id: response.data.id,
              tokenId: response.tokenId,
              username: response.data.username
            };
          $http.defaults.headers.common['x-access-token'] = response.tokenId;
          $rootScope.$broadcast('register:Successful');
        }, function errorCallback(response) {
        // called asynchronously if an error occurs or server returns response with an error status.
          //console.log(response);
          var message = '';
          if (response.data.reason.startsWith('duplicate') || response.data.reason.startsWith('llave dup')){
            message = '<div><p>' +  response.status + '</p><p> \'' + registerData.username + '\' already exists, please choose another username.</p></div>';
          }
          else{
            message = '<div><p>' +  response.status + '</p><p>' + response.data.reason + '</p></div>';
          }
          var alertPopup = $ionicPopup.alert({
            title: '<h4>Registration Failed!</h4>',
            template: message
          });

          alertPopup.then(function(res) {
            console.log('Registration Failed!');
          });
        });
    }
    
    function resetPassword(username){
        $http.post(baseURL + '/users/forgot', {"username":username}).then(
        function successCallback(response) {
            var alertPopup = $ionicPopup.alert({
                title: '<h4>Done!</h4>',
                template: 'Please, check your email for instructions on how to reset your password.'
            });
        }, function errorCallback(response) {
            console.log('forgot error response:' + JSON.stringify(response));
            var alertPopup = $ionicPopup.alert({
                title: '<h4>Error!</h4>',
                template: response.data.reason
            });
        });
    }

    return {
      login: login,
      logout: logout,
      register: register,
      isAuthenticated: isAuthenticated,
      getUsername: getUsername,
      getUserId: getUserId,
      getTokenId: getTokenId,
      resetPassword: resetPassword
    };
  }])

  .factory('$localStorage', ['$window', function ($window) {
      return {
          store: function (key, value) {
              $window.localStorage[key] = value;
          },
          get: function (key, defaultValue) {
              return $window.localStorage[key] || defaultValue;
          },
          remove: function (key) {
              $window.localStorage.removeItem(key);
          },
          storeObject: function (key, value) {
              $window.localStorage[key] = JSON.stringify(value);
          },
          getObject: function (key, defaultValue) {
              return JSON.parse($window.localStorage[key] || defaultValue);
          }
      }
  }])
;