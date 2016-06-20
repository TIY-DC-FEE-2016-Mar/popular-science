(function() {
    'use strict';

    angular.module('blog')
      .controller('CreateNewAuthorController', CreateNewAuthorController);

      CreateNewAuthorController.$inject = ['$state', 'NewAuthorService', 'LoginService'];

      function CreateNewAuthorController($state, NewAuthorService, LoginService){

        var that = this;
        this.newAuthor = {};
        this.errorMessage = "";

        this.newAuthorForm = function newAuthorForm() {

          return NewAuthorService.createAuthor(this.newAuthor)
            .then( LoginService.authenticate(this.newAuthor) )
            .then( function goHome() {
              $state.go('home');
            })
            .catch( function errorHandler(response) {
              if (response.status === 422) {
                that.errorMessage = "This user account already exists. Please use another email.";
              }
            });


          };

      }

})();
