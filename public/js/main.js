var _Posts, _PostList = [];

var getPosts = function() {
  var jqxhr = $.ajax( "http://localhost:3010/getPosts" )
  .done(function(response) {
    _Posts = response;
    populatePosts();
  })
  .fail(function() {
    alert( "error" );
  })
  .always(function() {
    console.log( "getPosts complete" );
  });
}

var makePost = function(post) {
  var postMade = ''+
  '<div class="demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-cell--12-col-desktop">'+
    '<div class="mdl-card__title mdl-card--expand mdl-color--yellow-300">'+
      '<h2 class="mdl-card__title-text">'+post.post_title+' by '+post.username+'</h2>'+
    '</div>'+
    '<div class="mdl-card__supporting-text mdl-color-text--grey-600">'+
      post.post_body+
    '</div>'+
    '<div class="mdl-card__actions mdl-card--border">'+
      '<a href="#" class="mdl-button mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">Read More<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></a>'+
    '</div>'+
  '</div>';

  _PostList.push(postMade);
}

var populatePosts = function() {
  _(_Posts).map(function(post, index) {
    makePost(post);
  }.bind(this)).value();


  _(_PostList).map(function(post, index) {
    $('.demo-content').append(post);
  }).value();

}
