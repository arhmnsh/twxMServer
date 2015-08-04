//vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

//custom library
//model
var Model = require('./model');

//index
var index = function(req, res, next) {
  if(!req.isAuthenticated()) {
    res.redirect('/signIn');
  } else {
    var user = req.user;

    if(user !== undefined) {
      user = user.toJSON();
    }
    res.render('index', {title: 'Home', user: user});
  }
};

//signIn
//GET
var signIn = function(req, res, next) {
  if(req.isAuthenticated()) res.redirect('/');
  res.render('signIn', {title: 'Sgin In'});
};

//signIn
//POST
var signInPost = function(req, res, next) {
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signIn'}, function(err, user, info) {
    if(err) {
      return res.render('signIn', {title: 'Sign In', errorMessage: err.message});
    }

    if(!user) {
      return res.render('signin', {title: 'Sign In', errorMessage: info.message});
    }
    return req.logIn(user, function(err) {
      if(err) {
        return res.render('signIn', {title: 'Sign In', errorMessage: err.message});
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next);
};

//signUp
//GET
var signUp = function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('signUp', {title: 'Sign Up'});
  }
};

//signUp
//POST
var signUpPost = function(req, res, next) {
  var user = req.body;
  var usernamePromise = null;
  usernamePromise = new Model.User({username: user.username}).fetch();

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
  });
};

//signOut
var signOut = function(req, res, next) {
  if(!req.isAuthenticated()) {
    notFound404(req, res, next);
  } else {
    req.logout();
    res.redirect('/signIn');
  }
};

//404 not found
var notFound404 = function(req, res, next) {
  res.status('404');
  res.render('404', {title: '404 Not Found'});
};


/*export functions*/

//index
module.exports.index = index;

//signIn
//GET
module.exports.signIn = signIn;
//POST
module.exports.signInPost = signInPost;

//signUp
//GET
module.exports.signUp = signUp;
//POST
module.exports.signUpPost = signUpPost;

//signOut
module.exports.signOut = signOut;

//404 not found
module.exports.notFound404 = notFound404;
