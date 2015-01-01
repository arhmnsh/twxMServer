var express = require('express'),
    // app = express(),
    // bodyParser = require('body-parser'),
    router = express.Router(),
    Post = require('../models/post'),
    passport = require('passport');

// app.use(bodyParser());


router.get('/getAll', function(req, res, next) {
  Post.getAll(function(err, posts) {
    if(!err) {
      res.status(200).json(posts);
    }
  });
});

router.post('/newPost', function(req, res, next) {

  var postData = {};
  postData.user_id = req.user.user_id;
  postData.post_title = req.body.post_content.title;
  postData.post_body = req.body.post_content.body;

  Post.newPost(postData, function(err, status) {
    console.log(err + status);
    if(!err) {
      return res.status(200).end();
    }
  });

});

module.exports = router;
