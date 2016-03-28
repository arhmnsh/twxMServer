var db = require('../db'),
logger = require('tracer').colorConsole();

exports.getPosts = function(postType, userId, cb) {
  logger.debug(userId+postType);
  db.getConnection(function(err, connection) {
    if(err) throw err;
    // select * from twx.posts where posts.user_id in(select followers.id_following from twx.followers where followers.user_id = req.user.user_id)
    var isDraft = 0, query;
    if(postType === 'getDrafts') { isDraft = 1; }
    if(isDraft === 0) {
      query = "SELECT posts.*, users.username, users.fullname, users.profile_image FROM twx.posts posts LEFT JOIN twx.followers followers ON posts.user_id = followers.following_id LEFT JOIN twx.users users ON users.user_id = posts.user_id WHERE (posts.is_draft = 0) AND (followers.user_id = "+userId+" OR posts.user_id = "+userId+") ORDER BY posts.created_at desc";
    } else {
      query = "SELECT posts.*, users.username, users.fullname, users.profile_image FROM twx.posts posts join twx.users users on users.user_id = posts.user_id WHERE posts.user_id = "+userId+" AND posts.is_draft = 1 ORDER BY posts.created_at DESC";
    }
    // connection.query("SELECT posts.*, users.username, users.fullname FROM twx.posts posts join twx.users users on users.user_id = posts.user_id WHERE posts.user_id = "+userId+" AND posts.is_draft = "+isDraft+" ORDER BY posts.created_at DESC", function(err, rows, fields) {
    logger.debug(query);
    connection.query(query, function(err, rows, fields) {
      connection.release();
      if(err) throw err;
      // res.json(rows);
      cb(null, rows);
    });
  });
}

exports.newPost = function(postData, postDetails, cb) {
  // logger.debug('new post posted...' + JSON.stringify(postData));
  var coverImageFilename = null;
  if(postDetails.coverImage64 != undefined) {
    //create randomized file name
    coverImageFilename = makeid()+"_"+postData.cover_image;
    // and then create image file and store it
    var base64Data = postDetails.coverImage64.replace(/^data:image\/(png|jpg|gif|jpeg|pjpeg|x-png);base64,/, "")
    require("fs").writeFile('./data/postCovers/'+coverImageFilename, base64Data, 'base64', function(err) {
      logger.debug(err);
    });
  } else {
    //as the coverimage file already exists, use the old filename
    coverImageFilename = postData.cover_image;
  }
  postData.cover_image = coverImageFilename;

  if(postDetails.wasDraft) {
    // make sure the draftPostId belongs to the logged in user
    db.getConnection(function(err, connection) {
      if(err) throw err;
      connection.query('SELECT user_id FROM twx.posts WHERE post_id = '+postDetails.draftPostId, function(err, rows, fields) {
        connection.release();
        if(err) {
          cb(err, 'error reading db');
          throw err;
        }
        if(rows.length != 0) {
          // compare logged in user_id with post's user_id
          if(rows[0].user_id === postData.user_id) {
            //update the post here
            logger.debug('updating the post...');
            db.getConnection(function(err, connection) {
              connection.query('UPDATE `twx`.`posts` SET ? WHERE post_id = '+postDetails.draftPostId, postData, function(err, rows, fields) {
                connection.release();
                if(err) {
                  cb(err, 'Error while updating post!');
                  throw err;
                  return;
                } else {
                  logger.debug('posted');
                  cb(null, 'Updated post');
                }
              });
            })

            logger.debug(postData);
          }
          else {
            cb('Auth Error', 'Post does not belongs to user');
          }
        } else {
          cb('Post Not Found', 'Post ID does not exist');
        }
      });
    })

  }

  //submit new post
  else {
    db.getConnection(function(err, connection) {
      if(err) throw err;

      connection.query('INSERT INTO twx.posts SET ?', postData, function(err, result) {
        connection.release();
        if(err) {
          cb(err, 'error while posting!');
          throw err;
          return;
        }
        else {
          logger.debug('posted : '+ JSON.stringify(result));
          cb(null, 'posted!!');
        }
      });
    })
  }


}

exports.getPost = function(postDetails, cb) {
  logger.debug("POSTDETAILS: ", postDetails);
  db.getConnection(function(err, connection) {
    var query = connection.query('SELECT posts.*, likes.like_id FROM twx.posts posts LEFT JOIN twx.likes likes ON posts.post_id = likes.post_id AND likes.user_id = '+postDetails.userId+' WHERE posts.post_id = '+ postDetails.postId, function(err, rows, fields) {
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
    logger.debug(query);
  });
}

//get a users posts
exports.getUserPosts = function(userid, cb) {
  db.getConnection(function(err, connection) {
    if(err) throw err;

    connection.query("SELECT twx.posts.*, users.username, users.fullname, users.profile_image FROM posts, users WHERE posts.user_id = users.user_id AND posts.is_draft = 0 AND posts.user_id = ?  ORDER BY posts.created_at DESC", userid, function(err, rows, fields) {
      connection.release();
      if(err) throw err;
      // res.json(rows);
      cb(null, rows);
    });
  });
}

exports.likePost = function(likeDetails, shouldLike, cb) {
  db.getConnection(function(err, connection) {
    if(err) throw err;

    var query = "";
    if(shouldLike) {
      query = "INSERT INTO `twx`.`likes` SET `user_id` = "+likeDetails.user_id+", `post_id` =  "+likeDetails.post_id+";";
    } else {
      query = "DELETE FROM `twx`.`likes` WHERE `user_id` = "+likeDetails.user_id+" AND `post_id` =  "+likeDetails.post_id+";"
    }

    connection.query(query, function(err, result) {
      connection.release();
      if(err) {
        cb(err, 'error updating like');
        throw err;
        return;
      } else {
        logger.debug("updated like!! " + JSON.stringify(result));
        cb(null, {status: 'success'});
      }
    });
    logger.debug('generatedLikeQuery: '+query);
  })
}

function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
