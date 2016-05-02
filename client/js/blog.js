(function() {
  'use strict';

  angular
  .module('blog', ['ui.router'])
  .config(blogConfig)
  .run(blogStartup);

  blogConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function blogConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/home.template.html',
      controller: 'HomeViewController',
      controllerAs: 'home'
    })
    .state('error', {
                url: '/eror',
                template: '<p class= "error-message"> Oops, something went wrong. Please contact us or try again later...</p>'
                // templateUrl: 'error/error.template.html',
                // controller: 'ErrorController',
                // controllerAs: 'error',
                // params: {
                //     msg: 'Something went wrong, please try back later...'
                // }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'login/login.template.html',
      controller: 'LoginController',
      controllerAs: 'lc',
      params: {
        msg: null
      }
    })
    .state('categoryStories', {
      url: '/category/:id',
      templateUrl: 'categories/category.template.html',
      controller: 'CategoryController',
      controllerAs: 'cc'
    })
    .state('allPosts', {
      url: '/allPosts',
      templateUrl: 'posts/allposts.template.html',
      controller: 'AllPostsController',
      controllerAs: 'allPosts'
    })
    .state('createAuthor', {
      url:'/create-author',
      templateUrl: 'create-author/create-author.template.html',
      controller: 'CreateNewAuthorController',
      controllerAs: 'cna'
    })
    .state('allStories', {
      url: '/allStories',
      templateUrl: 'posts/allposts.template.html'
    })
    .state('about', {
      url: '/about',
      templateUrl:"about/about.html"
    })
    .state('post', {
      url: '/post',
      controller: 'CreatePostController',
      controllerAs: 'post',
      templateUrl: 'create-post/create-post.template.html',
      secure: true
    })
    .state('viewPost', {
      url: '/post/:id',
      templateUrl:"posts/viewpost.template.html",
      controller: 'ViewPostController',
      controllerAs: 'vp'
    })
    .state('author', {
      url: '/author/:id',
      templateUrl:"author/author.template.html",
      controller: 'AuthorController',
      controllerAs: 'author'
    });
  }

  blogStartup.$inject = ["$rootScope", "$state", "LoginService"];

  function blogStartup($rootscope, $state, LoginService){
    $rootscope.$on('$stateChangeStart', function checkAuth (e, toState){
        console.log("inside of checkAuth");
         var isLoggedIn = !!LoginService.getLoginData();

         if (toState.secure && !isLoggedIn) {
           console.log('not logged in');
           e.preventDefault();
           $state.go('login', {msg: 'Please log in'});
         }
  });
}
})();
;(function() {
  // 'use strict';
  //
  // angular
  //   .module('blog')
  //   .controller('AboutController', AboutController);


// We many not need the below function and inject afterall
  // AboutController.$inject = ["$state"];
  // function AboutController($state){
  //
  //
  // }

}());
;(function() {
    'use strict';

    angular.module('blog')
      .controller('AuthorController', AuthorController);

      AuthorController.$inject = ['$state', '$stateParams', 'LoginService', 'postListFactory', 'deleteFactory'];

      function AuthorController($state, $stateParams, LoginService, postListFactory, deleteFactory) {

        var that = this;
        this.authorId = "";

        if (LoginService.getLoginData()) {
          this.authorId = LoginService.getLoginData().userId;
        }
        console.log('after if', this.authorId);
        this.allPosts = [];

        postListFactory.getPostsByAuthorID($stateParams.id)
          .then(function viewPosts(posts) {
            that.allPosts = posts;
        });

        this.areYouSure = false;

        this.deletePostID = null;

        this.askDeletePost = function askDeletePost(postId) {
          this.deletePostID = postId;
          this.areYouSure = true;
        };

        this.doNotDeletePost = function doNotDeletePost() {
          this.areYouSure = false;
        };

        this.deletePost = function deletePost(postId) {

          deleteFactory.deletePost(postId, LoginService.getLoginData().id)
            .then(function deleteSuccess() {
              $state.transitionTo($state.current, $stateParams, {
                reload: true,
                inherit: false,
                notify: true
              });
            });
        };


      }

})();
;(function() {
    'use strict';

    angular.module('blog')
      .controller('CategoryController', CategoryController);

      CategoryController.$inject = ['$stateParams', 'postListFactory'];

      function CategoryController($stateParams, postListFactory) {
        console.log($stateParams.id);
        console.log("in CategoryController");
        var that = this;
        this.allPosts = [];

        postListFactory.getPostsByCategoryID($stateParams.id)
          .then(function viewPosts(posts) {
            console.log(posts);
            that.allPosts = posts;
        });
        // this.recentPosts = postListFactory.getAllPosts();
        //sdfsdfsdfsdfsdf
      }

})();
;(function() {
    'use strict';

    angular.module('blog')
      .controller('CreateNewAuthorController', CreateNewAuthorController);

      CreateNewAuthorController.$inject = ['$state', 'NewAuthorService', 'LoginService'];

      function CreateNewAuthorController($state, NewAuthorService, LoginService){

        console.log('In Author Stories');
        var that = this;
        this.newAuthor = {};
        this.errorMessage = "";

        this.newAuthorForm = function newAuthorForm() {
          // console.log(this.newAuthor);
          console.log(LoginService);

          NewAuthorService.createAuthor(this.newAuthor)
            .then( LoginService.authenticate(this.newAuthor) )
            .then( function goHome() {
              console.log('success');
              $state.go('home');
            })
            .catch( function errorHandler(response) {
              console.log('failure', response);
              if (response.status === 422) {
                that.errorMessage = "This user account already exists. Please use another email.";
              }
            });


          };

      }

})();
;(function() {
    'use strict';

    angular.module('blog')
      .factory('NewAuthorService', NewAuthorService);

    NewAuthorService.$inject = ['$http'];

    function NewAuthorService($http) {

      return {
            createAuthor: createAuthor
        };

      function createAuthor(newAuthor) {
        console.log(newAuthor);
        return $http({
          method: 'POST',
          url: 'https://tiy-blog-api.herokuapp.com/api/Authors',
          data: { name: newAuthor.name, email: newAuthor.email, password: newAuthor.password }
        }).then(function successCallback(response) {
          console.log('Yay, new author!', response.data);
          return response.data;
        });
      }

    }

})();
;(function() {
  'use strict';

  angular
  .module('blog')
  .controller('CreatePostController', CreatePostController);

  CreatePostController.$inject = ['$state', 'CreatePostService', 'postListFactory', 'LoginService'];

  function CreatePostController ($state, CreatePostService, postListFactory, LoginService){
    this.categoryList = [];
    var that = this;
    this.myCategory = {};

    this.blogPost = {
      title: "",
      content: "",
      authorId: LoginService.getLoginData().userId,
      newCategory: null
    };

    this.newPost = function newPost (){

      this.blogPost.categoryId = this.myCategory.id;
      if (this.blogPost.newCategory){
        CreatePostService.createCategory(this.blogPost.newCategory, LoginService.getLoginData().id)
          .then(function newCatSuccess(newCat) {
            that.blogPost.categoryId = newCat.id;

            CreatePostService.submitPost(that.blogPost, LoginService.getLoginData().id)
              .then(function successHandler(newPost) {
                $state.go("viewPost", {id: newPost.id});
              });

          });

      } else {
      CreatePostService.submitPost(this.blogPost, LoginService.getLoginData().id)
        .then(function successHandler(newPost) {
          $state.go("viewPost", {id: newPost.id});
        });
      }
    };

    postListFactory.getAllCategories()
    .then(function (categories){
      that.categoryList = categories.data;
    });

  }

}());
;(function() {
  'use strict';

  angular
    .module('blog')
    .factory( 'CreatePostService', CreatePostService );

  CreatePostService.$inject = ['$http'];

  function CreatePostService ($http){

    return {
      submitPost: submitPost,
      createCategory: createCategory
    };

    function submitPost (blogPost, authorization){
      return $http ({
        method:'POST',
        url: "https://tiy-blog-api.herokuapp.com/api/Posts",
        data: blogPost,
        headers: {
          Authorization: authorization
        }
      }).then (function onSuccess(response){
        return response.data;
      }, function error(response) {
        console.log(response);
      }
    );
    }

    function createCategory(newCategory, authorization){
      return $http ({
        method: 'POST',
        url: "https://tiy-blog-api.herokuapp.com/api/Categories",
        data: { name: newCategory},
        headers: {
          Authorization: authorization
        }
      }).then (function onSuccess(response){
        return response.data;
      }, function error(response) {
        console.log(response);
      });
    }
  }

}());
;(function() {
    'use strict';

    angular
      .module('blog')
      .factory('deleteFactory', deleteFactory);

    deleteFactory.$inject = ['$http'];

    function deleteFactory($http) {

      var apiURL = 'https://tiy-blog-api.herokuapp.com/api';

      return {
        deletePost: deletePost
      };

      function deletePost(postId, token) {
        return $http({
          method: 'DELETE',
          url: apiURL + '/Posts/' + postId,
          headers: {
            Authorization: token
          }
        }).then(function successGetAllCategories(response) {
          return response;
        });
      }

    }

})();
;(function() {
    'use strict';

    angular.module('blog')
      .controller('HomeViewController', HomeViewController);

      HomeViewController.$inject = ['postListFactory', "LoginService"];

      function HomeViewController(postListFactory, LoginService) {
        var that = this;
        this.recentPosts = [];

        postListFactory.getAllPosts(3, 0, "date DESC")
          .then(function viewPosts(posts) {
            that.recentPosts = posts;
        });
        // this.recentPosts = postListFactory.getAllPosts();

        LoginService.getLoginData();

      }

})();
;
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
;(function() {
  'use strict';

  angular
    .module('blog')
    .factory("LoginService", LoginService);

    LoginService.$inject = ["$http"];


    function LoginService($http ) {

    	var loginData = null;
      

    	return {
    		authenticate: authenticate,      //this returns authenticate function
    		getLoginData: getLoginData,       //Inject LoginService and getLoginData to make sure it runs after the authentication happens
        logOut: logOut
    	};

    	function authenticate(author){
    		return $http({
    			method: "POST",
    			url: "https://tiy-blog-api.herokuapp.com/api/Authors/login",   //add "Authors/login" to authenticate the login
    			data: {
    				email: author.email,
    				password: author.password
    			}

    		}).then(function successHandler(response) {
            console.log('authenticate response', response);
      			loginData = response.data;
            return response.data;
	    		});
    	}

    	function getLoginData() {
    		  return loginData;
    	}

      function logOut() {
        loginData = null;
      }
    }

})();
;(function() {
  'use strict';

  angular
    .module('blog')
    .controller('AllPostsController', AllPostsController);

  AllPostsController.$inject = ['postListFactory'];

  function AllPostsController(postListFactory){

    var that = this;

    this.page = 0;

    this.nextPage = function nextPage(){
      console.log("inside on nextPage");
      that.page++;
      pagination(that.page)
        .then(function returnPostsList(response) {
          that.postList = response;
        });
    };

    this.nextPage();

    this.previousPage = function previousPage(){
      that.page--;
      pagination(that.page)
        .then(function returnPostsList(response) {
          that.postList = response;
        });
    };

    this.postList = [];

    function pagination(page) {
      return postListFactory.getAllPosts(10,((page-1)*10), "date DESC");
    }
  }
})();
;(function() {
  'use strict';

  angular
    .module('blog')
    .factory('postListFactory', postListFactory);

  postListFactory.$inject = ['$http'];

  function postListFactory($http) {

    var apiURL = 'https://tiy-blog-api.herokuapp.com/api';

    return {
      getAllPosts: getAllPosts,
      getAllCategories: getAllCategories,
      getCategoryID: getCategoryID,
      getPostsByCategoryID: getPostsByCategoryID,
      // getAuthorID: getAuthorID,
      getPostsByAuthorID: getPostsByAuthorID,
      getTitleID: getTitleID,
      getPostByTitleID: getPostByTitleID
    };

    /**
     * This function returns a promise with an array that contains all of the
     * posts on the site.
     * The contents of the return can be modified using filters as arguments.
     * @param  {[number]} limit   [This is the number of posts you want to return]
     * @param  {[number]} offset  [This is the index number of the first post
     *                            you want to return]
     * @param  {[string]} orderBy [Here you can sort by any key in the objects
     *                            and include ASC or DESC to sort in ascending
     *                            or decending order (eg. 'title ASC')]
     * @return {[promise]}        [Returns a promise with an array of all posts]
     */
    function getAllPosts(limit, offset, orderBy) {
      offset = offset || 0;
      limit = limit || null;
      return $http({
        method: 'GET',
        url: apiURL + '/Posts' + '?filter={"limit":' + limit + ',"offset":' + offset + ',"order":"' + orderBy + '","include":["author","category"]}',
      }).then(function successGetAllPosts(response) {
        return response.data;
      });
    }

    /**
     * This function returns a list of all of the categories on the site.
     * @return {[promise]} [Returns a promise with an array of all category objects]
     */
    function getAllCategories() {
      return $http({
        method: 'GET',
        url: apiURL + '/Categories' + '?filter={"include":"posts"}',
      }).then(function successGetAllCategories(response) {
        return response;
      });
    }

    /**
     * This function returns the category ID for a given category.
     * @param  {[string]} category [The name of the category to ID]
     * @return {[promise]}         [Returns a promise with a string of the
     *                             category's ID or else 'No such category']
     */
    function getCategoryID(category) {
      return $http({
        method: 'GET',
        url: apiURL + '/Categories?filter={"include":"posts"}',
      }).then(function successGetCategory(response) {
        var catid;
        response.data.forEach(function findCategoryID(each) {
          if(each.name === category){
            catid = each.id;
          } else {
            catid = 'No such category';
          }
        });
        return catid;
      });
    }

    /**
     * This function returns a list of all of the posts within a given category.
     * @param  {[string]} categoryID [The category ID of the desired category]
     * @return {[type]}              [Returns a promise with an array of all of
     *                               the posts within the given category]
     */
    function getPostsByCategoryID(categoryID) {
      return $http({
        method: 'GET',
        url: apiURL + '/Categories/' + categoryID + '?filter={"include":"posts", "order":"date DESC"}',
      }).then(function successGetPostsByCategory(response) {
        return response.data;
      });
    }

    /**
     * This function returns the author ID for a given author.
     * @param  {[string]} author [The name of the author to ID]
     * @return {[promise]}       [Returns a promise with a string of the author's
     *                           author ID or else 'No such author']
     */
    // function getAuthorID(author) {
    //   return $http({
    //     method: 'GET',
    //     url: apiURL + '/Authors',
    //     // TODO: I need to figure out where this authorization will come from.
    //     // data: {
    //     //   email: author.email,
    //     //   password: author.password
    //     // }
    //   }).then(function successGetAuthorID(response) {
    //     var authorID;
    //     response.data.forEach(function findAuthorID(each) {
    //       if(each.name === author){
    //         authorID = each.id;
    //       } else {
    //         authorID = 'No such author';
    //       }
    //     });
    //   });
    // }

    /**
     * This function returns a list of all of the posts from a given author.
     * @param  {[string]} authorID [The author ID of the desired author]
     * @return {[type]}            [Returns a promise with an array of all of
     *                             the posts from a given author]
     */
    function getPostsByAuthorID(authorID) {
      return $http({
        method: 'GET',
        url: apiURL + '/Posts?filter={"include":["author","category"], "order":"date DESC"}'
      }).then(function getPostsByAuthor(response) {
        var authorPostList = [];
        response.data.forEach(function successGetPostsByAuthorID(each) {
          if(each.authorId === authorID){
            authorPostList.push(each);
          }
        });
        return authorPostList;
      });
    }

    /**
     * This function returns the ID for a post given its title.
     * @param  {[string]} title [The title of a post]
     * @return {[promise]}      [Returns a promise with a string value of the ID
     *                          of the given post title]
     */
    function getTitleID(title) {
      return $http({
        method: 'GET',
        url: apiURL + '/Posts',
      }).then(function successGetTitleID(response) {
        var titleID;
        response.data.forEach(function searchForTitle(each) {
          if(each.title === title){
            titleID = each.id;
          }
        });
        return titleID;
      });
    }

    /**
     * This function returns the full post object of a given post ID
     * @param  {[string]} id [The ID of the desired post]
     * @return {[promise]}   [Returns a promise with the full object of the
     *                       desired post]
     */
    function getPostByTitleID(id) {
      return $http({
        method: 'GET',
        url: apiURL + '/Posts/' + id + '?filter={"include":["author","category"]}',
      }).then(function successGetPostByTitleID(response) {
        return response.data;
      });
    }
  }

})();
;(function() {
    'use strict';

    angular.module('blog')
      .controller('ViewPostController', ViewPostController);

      ViewPostController.$inject = ['$stateParams', 'postListFactory'];

      function ViewPostController($stateParams, postListFactory) {
        console.log($stateParams.id);
        console.log("in ViewPostController");
        var that = this;
        this.post = [];

        postListFactory.getPostByTitleID($stateParams.id)
          .then(function viewPost(post) {
            console.log(post);
            that.post = post;
        });

      }

})();
;(function() {
  'use strict';

  angular
    .module('blog')
    .controller('SidebarController', SidebarController);

  SidebarController.$inject = ['postListFactory'];

  function SidebarController(postListFactory) {

    var that = this;

    postListFactory.getAllCategories()
      .then(function returnCategoryList(response) {
        console.log(response);
        that.categories = response.data;
      });

    this.categories = [];
  }
})();

//# sourceMappingURL=blog.js.map