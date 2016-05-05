(function() {
  'use strict';

  var assert = chai.assert;

  suite('create new author service', function () {
    var NewAuthorService;
    var $httpBackend;

    setup(module('blog'));

    setup(inject(function (_NewAuthorService_, _$httpBackend_) {

      NewAuthorService = _NewAuthorService_;

      $httpBackend = _$httpBackend_;

      $httpBackend
        .whenPOST('https://tiy-blog-api.herokuapp.com/api/Authors')
        .respond({
          "id": 12345,
          "name": 'Matt',
          "email": 'mattgrosso@gmail.com',
          "password": 'password'
        });

        $httpBackend
          .whenGET('home/home.template.html')
          .respond('<p>Hi! I pretend to be the home page template!</p>');
    }));

    test('sanity check', function (){
      assert.strictEqual(1,1,'identiy function');
    });

    test('new author works', function (doneCallback){
      var tester = NewAuthorService.createAuthor({name: 'Matt', email: 'mattgrosso@gmail.com', password: 'password'});

      assert.ok(tester.then, 'test does return a promise');

      tester
        .then(function (response) {
          assert.strictEqual(response.id, 12345, 'the data returning is correct');
          doneCallback();
        })
        .catch(function () {
          assert.ok(false, 'the data is returning an error and that is not ok');
          doneCallback();
        });
        $httpBackend.flush();
    });

  });

})();
