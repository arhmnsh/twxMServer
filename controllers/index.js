var express = require('express'),
  router = express.Router(),
  // route = require('../route'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  bcrypt = require('bcrypt-nodejs'),
  request = require('request'),
  multer = require('multer'),
  db = require('../db'),
  User = require('../models/user'),
  Post = require('../models/post'),
  logger = require('tracer').colorConsole();


 router.use('/post', require('./posts'));



var storageMulter = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './data/profileImages');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
var uploadMulter = multer({ storage: storageMulter });
// router.get('/', function(req, res) {
//   res.render('index');
// });

//index
router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/signIn');
  } else {
    var user = req.user;
    var posts = 'test';
    //get posts
    request(req.protocol+'://'+req.get('host')+'/post/getAllPosts?userId='+user.user_id, function(error, response, body) {
      logger.debug(error)
      if (!error && response.statusCode == 200) {
        posts = body;
      }
      else {
        logger.debug('error: ' + error);
        logger.debug('response: ' + JSON.stringify(response));
        logger.debug('body: ' + body);
      }


      if(user !== undefined) {
        // user = user.toJSON();
      }
      res.render('index', {title: 'Home', user: user, posts: posts});

    });

  }
});



//drafts
router.get('/drafts', function(req, res, next) {
  logger.debug(req.user);
  if(!req.isAuthenticated()) {
    res.redirect('/signIn');
  } else {
    var user = req.user;
    var posts = 'test';
    //get posts
    request(req.protocol+'://'+req.get('host')+'/post/getDrafts', function(error, response, body) {
      logger.debug(error)
      if (!error && response.statusCode == 200) {
        posts = body;
      }
      else {
        logger.debug('error: ' + error);
        logger.debug('response: ' + JSON.stringify(response));
        logger.debug('body: ' + body);
      }


      if(user !== undefined) {
        // user = user.toJSON();
      }
      logger.debug(user.username);
      res.render('index', {title: 'Drafts', user: user, posts: posts});

    });

  }
});

//post
router.get('/post_old/:id', function(req, res, next) {
  // if(!req.isAuthenticated()) {
  //   res.redirect('/signIn');
  // } else {
    var user = req.user;
    logger.debug(req.protocol+'://'+req.get('host')+'/post/getPost/'+req.params.id);

    request(req.protocol+'://'+req.get('host')+'/post/getPost/'+req.params.id, function(error, response, post) {
      if(error) { logger.debug('error!!: '+error); }


      if(!error && response.statusCode == 200) {
        res.render('post', {title: 'khjr post', user: user, post: JSON.parse(post)[0]})
      }
    });
    // request('http://localhost')
    // res.render('post', {title: 'Post'});
  // }
})

//newPost
router.get('/edit/:id?', function(req, res, next) {
  if(!req.isAuthenticated()) {
  // if(false) {
    res.redirect('/signIn');
  } else {
    var post = 'meow';
    if(!req.params.id) {
      res.render('edit', {title: 'Edit Post'});
    } else {
      // request(req.protocol+'://'+req.get('host')+'/post/getPost/'+req.params.id, function(error, response, post) {
      var postDetails = {};
      postDetails.postId = req.params.id;
      postDetails.userId = null;
      postDetails.userId = req.user.user_id;
      logger.debug("postDetails. "+JSON.stringify(postDetails));

      Post.getPost(postDetails, function(err, post) {
        logger.debug(post);
        if(err) { logger.debug('err!!: '+err); }

        if(!err) {
          post = post[0];
          if(post.user_id === req.user.user_id && post.is_draft === 1) {
            res.render('edit', {title: 'Edit Post', post: post});
          } else {
            res.render('404', {title: '404 Not Found'});
          }
        }
      });
    }

  }
});


//signIn
router.get('/signIn', function (req, res, next) {
  if(req.isAuthenticated()) res.redirect('/');
  res.render('signIn', {title: 'Sign In'});
});

router.post('/signIn', function(req, res, next) {
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signIn'}, function(err, user, info) {
    if(err) {
      return res.render('signIn', {title: 'Sign In', errorMessage: err.message});
    }

    if(!user) {
      return res.render('signin', {title: 'Sign In', errorMessage: info.message});
    }
    return req.logIn(user, function(err) {
      if(err) {
        return res.render('signIn', {title: 'Sign In Error', errorMessage: err.message});
      } else {
        return res.redirect('/');
        //TEMP: redirect to /newPost for testing
        // return res.redirect('/newPost');
      }
    });
  })(req, res, next);
});

//signUp
router.get('/signUp', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('signUp');
  }
});
router.post('/signUp', function(req, res, next) {
  var user = req.body;
  var usernamePromise = null;
  logger.debug( user);
  // return;
  /*usernamePromise = new Model.User({username: user.username}).fetch();

  return usernamePromise.then(function(model) {
    if(model) {
      res.render('signup', {title: 'signUp', errorMessage: 'username already exists'});
    } else {
      //more validated here e.g. password validation
      var password = user.password;
      var hash = bcrypt.hashSync(password);

      var signUpUser = new Model.User({username: user.username, password: hash});

      signUpUser.save().then(function(model) {
        //sign in the newly registered user
        signInPost(req, res, next);
      });
    }
  });*/
  db.getConnection(function(err, connection) {
    connection.query("SELECT * FROM users WHERE username = '"+user.username+"'", function(err, rows) {
      logger.debug(rows);
      logger.debug("--signup alread existing user rows--");

      if (err) {
        logger.debug(err);
        return done(err);
      }
      if (rows.length) {
        res.render('signup', {errorMessage: 'Username already exists'});
      } else {
        //if there is no user with that username, create the new user
        var newUserMysql = new Object();
        newUserMysql.username = user.username;
        newUserMysql.password = user.password;

        var insertQuery = "INSERT INTO users (username, fullname, password) values('"+user.username+"','"+user.fullname+"','"+user.password+"')";
        logger.debug(insertQuery);

        connection.query(insertQuery, function(err, rows) {
          newUserMysql.userId = rows.insertId;
          // return done(null, newUserMysql);
          signInPost(req, res, next);
        });
      }
    });
  });
});

//logout
router.get('/signOut', function(req, res, next) {
  // if(!req.isAuthenticated()) {
  //   notFound404(req, res, next);
  // } else {
    req.logout();
    res.redirect('/signIn');
  // }
});

//settings
router.get('/settings', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/signIn');
  } else {
    var user = req.user;

    res.render('userSettings', {user: user});
  }
});

router.post('/settings', uploadMulter.single('profile_image'), function(req, res, next) {
  // if(!req.isAuthenticated()) {
  //   notFound404(req, res, next);
  // } else {

    var userDetails = {
      'user_id': req.user.user_id,
      'fullname': req.body.fullname,
      'username': req.body.username,
      'bio': req.body.bio,
      'location': req.body.location
    }
    if(req.file) {
      userDetails.profile_image = req.file.filename;
    }

    User.updateUserDetails(userDetails, function(err, result) {
      if(!err) {
        logger.debug(result);
        res.status('200').end();
      } else {
        res.render('userSettings', {errorMessage: 'Error updating details', err: err});
      }
    })

  // }
});

router.post('/follow', function(req, res, next) {
  var followDetails = {};
  followDetails.user_id = req.user.user_id;
  followDetails.following_id = req.body.following_id;
  var shouldFollow = req.body.follow;

  User.follow(followDetails, shouldFollow, function(err, status) {
    logger.debug(err + status);
    if(!err) {
      res.status(200).send(status);
    } else {
      res.status(200).send({errorMessage: err});
    }
  });

});



//route placed at last, to avoid conflicting with other routes
//beacuse of optional root route parameter
router.get('/:username?/:follow?', function(req, res, next) {
  var username = req.params.username;
  var followStatsType = req.params.follow;
  if(followStatsType !== undefined) {
    followStatsType = followStatsType.toLowerCase();
  }
  var loggedInUserid;
  if(req.user) loggedInUserid = req.user.user_id;
  logger.debug('loggedInUserid: '+loggedInUserid);
  if(!username) {

    next();
    return;
  } else {
    logger.debug("GETTING USER DETAILS!!!");
    logger.debug(username);
    User.getUserDetails(loggedInUserid, username, function(err, userDetails) {
      if(!err) {
        if(userDetails == undefined) {
          res.render('userProfile', {errorMessage: 'User does not exist'});
          return;
        } else {
          //user exists, load their posts
          var userid = userDetails.user_id;


          //for getting route followers/following details
          if(followStatsType !== undefined) {
            if(followStatsType === 'following' || followStatsType === 'followers'){
              User.getFollowDetails(userid, followStatsType, function(err, followDetails) {
                logger.debug(followDetails);
                res.render('userFollows', {user: userDetails, followDetails: followDetails, title: followStatsType});
              })
            } else {
              next();
            }
          } else {
            Post.getUserPosts(userid, function(err, rows) {
              res.render('userProfile', {user: req.user, userDetails: userDetails, userPosts: rows})
            });
          }
        }
      }
      else {
        logger.debug(err);
        res.status(200).send({errorMessage: err});
        return
      }
    });

  }

});


//404 not found
var notFound404 = router.use(function(req, res, next) {
  res.status('404');
  res.render('404', {title: '404 Not Found'});
});




module.exports = router;
