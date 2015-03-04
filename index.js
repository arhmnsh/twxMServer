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

    connection.query("SELECT * FROM tweets", function(err, rows, fields) {
      connection.release();
      if(!err) {
        res.json(rows[1]['post_content']);
        return;
      }
    });
  });
}

app.get("/getTweets", function(req, res) {
  getTweets(req, res);
});

app.listen(3010);