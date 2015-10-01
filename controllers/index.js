var express = require('express'),
    router = express.Router(),
    // route = require('../route'),
    passport = require('passport'),
    bcrypt = require('bcrypt-nodejs'),
    request = require('request'),
    db = require('../db');


router.use('/posts', require('./posts'));

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
    request('http://localhost:3000/posts/getAll', function(error, response, body) {
      if (!error && response.statusCode == 200) {
        posts = body;
      }
      else {
        console.log('error: ' + error);
        console.log('response: ' + JSON.stringify(response));
        console.log('body: ' + body);
      }


      if(user !== undefined) {
        // user = user.toJSON();
      }
      res.render('index', {title: 'Home', user: user, posts: posts});

    });

  }
});

//newPost
router.get('/newPost', function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/signIn');
  } else {
    res.render('newPost', {title: 'New Post'});
  }
});


//signIn
router.get('/signIn', function (req, res, next) {
  if(req.isAuthenticated()) res.redirect('/');
  res.render('signIn', {title: 'Sgin In'});
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
        // return res.redirect('/');
        //TEMP: redirect to /newPost for testing
        return res.redirect('/newPost');        
      }
    });
  })(req, res, next);
});

//signUp
router.get('/signUp', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('signUp', {title: 'Sign Up'});
  }
});
router.post('/signUp', function(req, res, next) {
  var user = req.body;
  var usernamePromise = null;
  console.log( user);
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
    connection.query("SELECT * FROM users WHERE screen_name = '"+user.username+"'", function(err, rows) {
      console.log(rows);
      console.log("--signup alread existing user rows--");

      if (err) {
        console.log(err);
        return done(err);
      }
      if (rows.length) {
        res.render('signup', {errorMessage: 'Username already exists'});
      } else {
        //if there is no user with that username, create the new user
        var newUserMysql = new Object();
        newUserMysql.username = user.username;
        newUserMysql.password = user.password;

        var inserQuery = "INSERT INTO users (screen_name, name, password) values('"+user.username+"','MyName','"+user.password+"')";
        console.log(inserQuery);

        connection.query(inserQuery, function(err, rows) {
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
  if(!req.isAuthenticated()) {
    notFound404(req, res, next);
  } else {
    req.logout();
    res.redirect('/signIn');
  }
});

//404 not found
router.use(function(req, res, next) {
  res.status('404');
  res.render('404', {title: '404 Not Found'});
});



module.exports = router;
