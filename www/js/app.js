// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'basculando' is the name of this angular module (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'basculando.controllers' is found in controllers.js
angular.module('basculando', ['ionic', 'basculando.controllers', 'basculando.friends', 'basculando.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
    })

    .state('app.friends', {
      url: '/friends',
      views: {
        'menuContent': {
          templateUrl: 'templates/friends.html',
          controller: 'FriendsCtrl'
        }
      }
    })

    .state('app.user', {
      url: '/user/:userId',
      views: {
        'menuContent': {
          templateUrl: 'templates/user.html',
          controller: 'UserCtrl'
        }
      }
    })

    .state('app.profile', {
      url: '/profile/:userId',
      views: {
        'menuContent': {
          templateUrl: 'templates/editProfile.html',
          controller: 'EditProfileCtrl'
        }
      }
    })

    .state('app.addFriend', {
      url: '/addFriend',
      views: {
        'menuContent': {
          templateUrl: 'templates/addFriend.html',
          controller: 'AddFriendCtrl'
        }
      }
    })

    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html',
          controller: ''
        }
      }
    })

    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/user/0');
});
