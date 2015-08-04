var db = require('../db');

exports.getAll = function(cb) {
  db.getConnection(function(err, connection) {
    if(err) throw err;

    connection.query("SELECT posts.*, users.screen_name FROM posts, users WHERE posts.user_id = users.user_id ORDER BY posts.created_at DESC", function(err, rows, fields) {
      if(err) throw err;
      res.json(rows);
      cb(null, rows);
    });
  })
}
