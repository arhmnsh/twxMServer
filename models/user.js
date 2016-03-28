var db = require('../db');

exports.updateUserDetails = function(userDetails, cb) {
  db.getConnection(function(err, connection) {
    if(err) throw err;
    connection.query('UPDATE `twx`.`users` SET ? WHERE user_id = '+userDetails.user_id, userDetails, function(err, rows, fields) {
      connection.release();
      if(err) throw err;
      // res.json(rows);
      cb(null, rows);
    });
  });
}

exports.getUserDetails = function(loggedInUserid, username, cb) {
  db.getConnection(function(err, connection) {
    connection.query('SELECT * FROM twx.users WHERE username = ?', username, function(err, rows) {
      console.log('test log');
      console.log(rows[0]);
      console.log(err);
      if(err) {
        connection.release();

        cb(err, 'error getting user details');
        throw err;
        return;
      } else {
        var userDetails = rows[0];

        //check for followingstatus

        if(loggedInUserid !== 'undefined' && loggedInUserid !== userDetails.user_id) {
          console.log('checking followingstatus...');
          connection.query('SELECT count(1) count FROM twx.followers WHERE user_id = ? AND following_id = ?', [loggedInUserid, userDetails.user_id], function(err, followingRows) {

            if(err) {
              cb(err, 'error getting followingStatus details');
              throw err;
              return;
            } else {
              console.log(followingRows);
              if(followingRows[0].count > 0) {
                userDetails.isFollowing = true;
              } else {
                userDetails.isFollowing = false;
              }
            }
          });
        }
        connection.release();

        cb(null, userDetails);
      }
    });
  });
};


exports.getFollowingStatus = function(userid, otherUserid, cb) {
  db.getConnection(function(err, connection) {
    connection.query('SELECT count(*) FROM twx.followers WHERE user_id = ? AND following_id = ?', [userid, otherUserid], function(err, rows) {
      connection.release();
      if(err) {
        cb(err, 'error getting following status');
        throw err;
        return;
      } else {
        cb(null, rows);
      }
    });
  });
};

exports.follow = function(followDetails, shouldFollow, cb) {
  console.log('followDetails: '+ JSON.stringify(followDetails));
  db.getConnection(function(err, connection) {
    var query;
    if(shouldFollow) {
      query = 'INSERT INTO twx.followers SET user_id = ?, following_id = ?';
    } else {
      query = 'DELETE FROM twx.followers WHERE user_id = ? AND following_id = ?';
    }

    var generatedQuery = connection.query(query, [followDetails.user_id, followDetails.following_id], function(err, result) {
      connection.release();
      if(err) {
        cb(err, 'error following');
        throw err;
        return;
      } else {
        console.log("FOLLOWED!! " + JSON.stringify(result));
        cb(null, {status: 'success'});
      }

    });

    console.log('generatedQuery: '+generatedQuery.sql);
  });
}

exports.getFollowDetails = function(userid, followStatsType, cb) {
  var query;
  if(followStatsType == 'followers') {
    query = 'SELECT u.* FROM twx.users t1 inner join twx.followers t2 on t1.user_id  = t2.following_id inner join twx.users u on (u.user_id = t2.user_id) where t1.user_id = ?';
  } else if(followStatsType == 'following') {
    query = 'SELECT u.* FROM twx.users t1 inner join twx.followers t2 on t1.user_id  = t2.user_id inner join twx.users u on (u.user_id = t2.following_id) where t1.user_id = ?';
    }
  db.getConnection(function(err, connection) {
    var generatedQuery = connection.query(query, userid, function(err, rows) {
      connection.release();
      if(err) {
        cb(err, 'error getting '+followStatsType+' details');
        throw err;
        return;
      } else {
        cb(null, rows);
      }
    })
  })
}
