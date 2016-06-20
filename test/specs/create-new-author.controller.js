(function() {
  'use strict';

  var assert = chai.assert;

  suite('create new author controller', function () {

    var createNewAuthorController;
    var $rootScope;
    var mockNewAuthorService = {};
    var mockLoginService = {};

    setup(module('blog'));

    setup(module(function ($provide) {
      $provide.value('NewAuthorService', mockNewAuthorService);
      $provide.value('LoginService', mockLoginService);
    }));

    setup(inject(function ($controller, $q, _$rootScope_) {
      $rootScope = _$rootScope_;
      createNewAuthorController = $controller('CreateNewAuthorController');
      mockNewAuthorService.createAuthor = function (author) {
        var def = $q.defer();

        if (author.name === 'Jordan') {
          def.reject({
            status: 422
          });
        } else if(author.name === 'Matt'){
          def.reject({
            status: 499
          });
        } else {
          def.resolve({
            "id": 12345,
            "name": 'Matt',
            "email": 'mattgrosso@gmail.com',
            "password": 'password'
          });
        }
        return def.promise;
      };
      mockLoginService.authenticate = function () {
        var defLogin = $q.defer();
        defLogin.resolve({
          id: 1111,
          userId: 1234
        });
        return defLogin.promise;
      };
    }));

    test('sanity check', function (){
      assert.strictEqual(1, 1, 'Math be true.');
    });

    test('newAuthorForm errors correctly with 422', function (doneCallback) {
      createNewAuthorController.newAuthor = {
        name: 'Jordan'
      };
      createNewAuthorController.newAuthorForm().then(function () {
        assert.isAtLeast(createNewAuthorController.errorMessage.length, 5, 'There is an error message');
        doneCallback();
      });
      $rootScope.$digest();
    });

  });
})();
