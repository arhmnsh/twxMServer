var express = require('express'),
    // app = express(),
    // bodyParser = require('body-parser'),
    router = express.Router(),
    Post = require('../models/post'),
    passport = require('passport'),
    JFUM = require('jfum'),
    logger = require('tracer').colorConsole();


var jfum = new JFUM({
  minFileSize: 10240,                      // 10 kB
  maxFileSize: 5242880,                     // 5 mB
  acceptFileTypes: /\.(gif|jpe?g|png)$/i    // gif, jpg, jpeg, png
});

// app.use(bodyParser());


router.get('/getAllPosts', function(req, res, next) {
  var userId = req.query.userId;
  logger.debug('userId: ', userId);
  Post.getPosts('getPublishedPosts', userId, function(err, posts) { //second parameter is user_id
    if(!err) {
      res.status(200).json(posts);
    }
  });
});

router.get('/getDrafts', function(req, res, next) {
  // logger.debug(req.user.user_id);
  Post.getPosts('getDrafts', 1, function(err, posts) { //second parameter is user_id
    if(!err) {
      res.status(200).json(posts);
    }
  });
});


router.get('/getUserPosts', function(req, res, next) {
  var username = req.param('username');
  logger.debug("GETTING USER DETAILS");
  Post.getUserDetails(username, function(err, rows) {
    if(!err) {
      if(!rows.length) {
        res.render('userProfile', {errorMessage: 'User does not exist'});
        return;
      } else {
        logger.debug(rows);
        res.render('userProfile', {userDetails: rows})
      }
    }
    else {
      logger.debug(err);
      res.status(200).send({errorMessage: err});
      return
    }
  });
  // Posts.getUserPosts(username, function(err, posts) {
  //   if(!err) {
  //     res.status(200).json(posts);
  //   }
  //   else {
  //     logger.debug(err);
  //     res.status(200).send({errorMessage: err});
  //   }
  // })
})



router.post('/newPost', function(req, res, next) {
  // logger.debug('this is from new post '+req.user);
  // return;
  // logger.debug(JSON.stringify(req));
  var postData = {};
  postData.user_id = req.user.user_id;
  postData.post_title = req.body.post_content.title;
  postData.post_body = req.body.post_content.body;
  postData.cover_image = req.body.post_content.coverImageFilename;
  postData.is_draft = req.body.post_content.isDraft;
  // postData.draftPostDetails = req.body.post_content.draftPostDetails;

  var postDetails = {};
  postDetails.coverImage64 = req.body.post_content.coverImage;
  postDetails.wasDraft = req.body.post_content.wasDraft;
  postDetails.draftPostId = req.body.post_content.draftPostId;

  logger.debug(JSON.stringify(postData) +"\n"+JSON.stringify(postDetails));

  Post.newPost(postData, postDetails, function(err, status) {
    logger.debug(err + status);
    if(!err) {
      return res.status(200).end();
    }
  });

});

router.get('/getPost/:id', function(req,res,next) {
  var postId = req.param('id');
  var userId = null;
  if(req.isAuthenticated()) {
    userId = req.user.user_id;
  }
  logger.debug("user "+req.user);
  logger.debug(req.isAuthenticated());

  Post.getPost(postId, function(err, post) {

    if(!err) {
      // return res.status(200).end()
      res.status(200).json(post);
    } else {
      res.status(404).json(err);
    }
  });
});

router.post('/likePost', function(req, res, next) {
  if(req.isAuthenticated()) {
    var likeDetails = {
      "user_id": req.user.user_id,
      "post_id": req.body.postId
    }
    logger.debug(likeDetails);

    Post.likePost(likeDetails, req.body.shouldLike, function(err, status) { //likeDetails, like/unlike
      logger.debug(err + status);
      if(!err) {
        res.status(200).send(status);
      }
    });

  }
});


router.options('/uploadPostImages', jfum.optionsHandler.bind(jfum));

router.post('/uploadPostImages', jfum.postHandler.bind(jfum), function(req, res) {
  // Check if upload failed or was aborted
  if (req.jfum.error) {
    logger.debug(req.jfum.error);

  } else {
    // Here are the uploaded files
    for (var i = 0; i < req.jfum.files.length; i++) {
      var file = req.jfum.files[i];
      // Check if file has errors
      if (file.errors.length > 0) {
        for (var j = 0; i < file.errors.length; i++) {
          logger.debug(file.errors[j].code);
          logger.debug(file.errors[j].message);
        }

      } else {
        var response = {
                         files:
                           [
                             {
                               url: file.path
                             }
                           ]
                       }
        res.status(200).send(response);
        // file.field - form field name
        // file.path - full path to file on disk
        // file.name - original file name
        // file.size - file size on disk
        // file.mime - file mime type
      }
    }
  }
});

//route placed at last, to avoid conflicting with other routes
//beacuse of optional root route parameter
router.get('/:postId?', function(req, res, next) {
  var postDetails = {};
  postDetails.postId = req.params.postId;
  postDetails.userId = null;

  if(req.isAuthenticated()) {
    postDetails.userId = req.user.user_id;
  }
  logger.debug("postDetails. "+JSON.stringify(postDetails));




  Post.getPost(postDetails, function(err, post) {

    if(!err) {
      // return res.status(200).end()
      // res.status(200).json(post);
      // logger.debug(post[0]);
      res.render('post', {title: 'khjr post', user: req.user, post: post[0]})
    } else {
      res.render('post', {title: 'Post not found', err: err})
    }
  });



  // request(req.protocol+'://'+req.get('host')+'/post/getPost/'+req.params.id, function(error, response, post) {
  //   if(error) { logger.debug('error!!: '+error); }
  //
  //
  //   if(!error && response.statusCode == 200) {
  //     res.render('post', {title: 'khjr post', user: user, post: JSON.parse(post)[0]})
  //   }
  // });
});

module.exports = router;
