var db = require('../db');
// var mysql = require('mysql');
//
// var connection = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'twx',
//   debug: false
// });

exports.getAll = function(cb) {
  db.getConnection(function(err, connection) {
    if(err) throw err;

    connection.query("SELECT twx.posts.*, users.screen_name FROM posts, users WHERE posts.user_id = users.user_id ORDER BY posts.created_at DESC", function(err, rows, fields) {
      connection.release();
      if(err) throw err;
      // res.json(rows);
      cb(null, rows);
    });
  });
}

exports.newPost = function(postData, cb) {
  // console.log('new post posted...' + JSON.stringify(postData));

  db.getConnection(function(err, connection) {
    if(err) throw err;

    connection.query('INSERT into twx.posts SET ?', postData, function(err, result) {
      connection.release();
      if(err) {
        cb(err, 'error while posting!');
        throw err;
        return;
      }
      else {
        console.log('posted : '+ JSON.stringify(result));
        cb(null, 'posted!!');
      }
    });
  })

}
