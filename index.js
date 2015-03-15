var express = require('express');
var mysql = require('mysql');
var app = express();

var pool = mysql.createPool({
  connectionLimit: 100, //important
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'twx',
  debug: false
});

function getTweets(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      connection.release();
      res.json({"code" : 100, "status" : "Error in connecting to database"});
      return;
    }

    console.log("Connected as ID: ", connection.threadId);

    connection.query("SELECT tweets.*, users.screen_name FROM tweets, users WHERE tweets.user_id = users.user_id ORDER BY tweets.created_at", function(err, rows, fields) {
      connection.release();
      if(!err) {
        res.json(rows);
        return;
      }
    });
  });
}

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
})

app.get("/getTweets", function(req, res) {
  getTweets(req, res);
});

app.listen(3010);