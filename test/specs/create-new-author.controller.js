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
      createNewAuthorController = $controller('NewAuthorController');
      mockNewAuthorService.createAuthor = function () {
        var def = $q.defer();
        def.resolve({
          "id": 12345,
          "name": 'Matt',
          "email": 'mattgrosso@gmail.com',
          "password": 'password'
        });
        return def.promise;
      };
      mockLoginService.authenticate = function () {
        var defLogin = $q.defer();
        defLogin.resolve({
          login: true,
        });
        return defLogin.promise;
      };
    }));

    test('sanity check', function (){
      assert.strictEqual(1,1,'Math be true.');
    });

    test('', function (){

    });

  });
})();
