//vendor libraries
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + '/public'));
app.use('/components', express.static(__dirname + '/views/components'));

app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'secret strategic xxzzz code'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('./controllers'));

var db = require('./db');

passport.use(new LocalStrategy(function(username, password, done) {
  // new Model.User({username: username}).fetch().then(function(data) {
  //   var user = data;
  //   if(user === null) {
  //     return done(null, false, {message: 'Invalid username or password'});
  //   } else {
  //     user = data.toJSON();
  //     if(!bcrypt.compareSync(password, user.password)) {
  //       return done(null, false, {message: 'Invalid username or password'});
  //     } else {
  //       return done(null, user);
  //     }
  //   }
  // });

  db.getConnection(function(err, connection) {
    if(err) throw err;
    connection.query("SELECT * FROM `users` WHERE `screen_name` = '" + username + "'",function(err,rows){
      connection.release();
       if (err)
         return done(err);
       if (!rows.length) {
         return done(null, false, {message: 'Invalid username or password'}); // req.flash is the way to set flashdata using connect-flash
       }

       // if the user is found but the password is wrong
       if (!( rows[0].password == password))
         return done(null, false, {message: 'Invalid password'}); // create the loginMessage and save it to session as flashdata

       // all is well, return successful user
           return done(null, rows[0]);

     });
  })


}));

passport.serializeUser(function(user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function(userId, done) {
  db.getConnection(function(err, connection) {
    connection.query("select * from users where user_id = "+userId,function(err,rows){
      connection.release();
  		done(err, rows[0]);
  	});
    // new Model.User({username: username}).fetch().then(function(user) {
    //   done(null, user);
    // });
  });

});




var server = app.listen(app.get('port'), function(err) {
  if(err) throw err;

  var message = 'Server is running @ http://localhost:' + server.address().port;
  console.log(message);
});
