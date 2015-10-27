var express = require('express'),
    // app = express(),
    // bodyParser = require('body-parser'),
    router = express.Router(),
    Post = require('../models/post'),
    passport = require('passport');

// app.use(bodyParser());


router.get('/getAllPosts', function(req, res, next) {
  Post.getAll(function(err, posts) {
    if(!err) {
      res.status(200).json(posts);
    }
  });
});

router.post('/newPost', function(req, res, next) {
  // console.log(req.body);
  // console.log(JSON.stringify(req));
  var postData = {};
  postData.user_id = req.user.user_id;
  postData.post_title = req.body.post_content.title;
  postData.post_body = req.body.post_content.body;
  postData.cover_image = req.body.post_content.coverImageFilename;
  postData.is_draft = req.body.post_content.isDraft;

  var coverImage = req.body.post_content.coverImage;

  Post.newPost(postData, coverImage, function(err, status) {
    console.log(err + status);
    if(!err) {
      return res.status(200).end();
    }
  });

});

router.get('/getPost/:id', function(req,res,next) {
  var postId = {};
  postId.post_id = req.param('id');
  Post.getPost(postId, function(err, status) {
    console.log(err + JSON.stringify(status));
    if(!err) {
      // return res.status(200).end()
      res.status(200).json(status);
    } else {
      res.status(404).json(err);
    }
  });
});

module.exports = router;
