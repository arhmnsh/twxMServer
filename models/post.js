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

    connection.query("SELECT twx.posts.*, users.screen_name FROM posts, users WHERE posts.user_id = users.user_id AND posts.is_draft = 0 ORDER BY posts.created_at DESC", function(err, rows, fields) {
      connection.release();
      if(err) throw err;
      // res.json(rows);
      cb(null, rows);
    });
  });
}

exports.newPost = function(postData, coverImage, cb) {
  // console.log('new post posted...' + JSON.stringify(postData));
  var coverImageFilename = null;

  if(coverImage !== undefined) {
    coverImageFilename = makeid()+"_"+postData.cover_image;
    var base64Data = coverImage.replace(/^data:image\/(png|jpg|gif|jpeg|pjpeg|x-png);base64,/, "")
    require("fs").writeFile('./data/postImages/'+coverImageFilename, base64Data, 'base64', function(err) {
      console.log(err);
    });
  }

  postData.cover_image = coverImageFilename;

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

exports.getPost = function(postId, cb) {
  db.getConnection(function(err, connection) {
    connection.query('SELECT * FROM twx.posts WHERE ?', postId, function(err, rows, fields) {
      connection.release();

      if(err) {
        cb(err, 'error getting post');
        throw err;
        return;
      } else if (rows.length === 0) {
        cb('Post Not Found', 'Post Not Found');
        // throw err;
      }

       else {
        cb(null, rows);
      }
    });
  });
}


function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
