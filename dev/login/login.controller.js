
(function() {
  'use strict';

  angular
    .module('blog')
    .controller("LoginController", LoginController);

  LoginController.$inject = ["$stateParams", "$state", "LoginService"];

  function LoginController($stateParams, $state, LoginService) {
    this.msg = $stateParams.msg;
    this.login = {};
    this.errorMessage = "";
    var that = this;

    this.loginForm = function loginForm(){
      LoginService.authenticate(this.login)
        .then(function(){
          $state.go("home");

        // LoginService.getLoginData();   Now you can run that logindata and it will return the user's Login Data, in this case, response.data
        //state.go should go here because the controller marries the UI with the data
      })
      .catch(function(response) {
        if (response.status > 499) {
          $state.go('error', {msg:'Something is wrong, please contact us or try back later...'});
        }
        else {
          that.errorMessage = "Please enter your correct login information or create a new account.";
        }
      });
    };

    this.register = function register (){
      $state.go("createAuthor");
    };

    this.logout = function logout(){
      this.login = {};
      console.log(this.login);

      LoginService.logOut();
      $state.go("home");
    //This function calls logout in Login service and redirects to home
    };

    this.isLoggedIn = function isLoggedIn() {
      return !!LoginService.getLoginData();
    };
  }

})();
