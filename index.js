var express = require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');

var pool = mysql.createPool({
  connectionLimit: 100, //important
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'twx',
  debug: false
});

function getPosts(req, res) {
  pool.getConnection(function(err, connection) {
    if (err) {
      connection.release();
      res.json({"code" : 100, "status" : "Error in connecting to database"});
      return;
    }

    console.log("Connected as ID: ", connection.threadId);

    connection.query("SELECT posts.*, users.screen_name FROM posts, users WHERE posts.user_id = users.user_id ORDER BY posts.created_at DESC", function(err, rows, fields) {
      connection.release();
      if(!err) {
        res.json(rows);
        return;
      }
    });
  });
}

function submitPost (req, res) {
  console.log(req.body);
}

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.use(bodyParser.json());

app.get("/getPosts", function(req, res) {
  getPosts(req, res);
});

app.post("/submitPost", function(req, res) {
  // submitPost(req, res);
  console.log(req.body);
});

app.listen(3010);