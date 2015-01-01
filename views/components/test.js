var React = require('react');
var ReactDOM = require('react-dom');

var Post = ReactDOM.render(
  <div className="mdl-grid demo-content">
    {/*<% var posts = JSON.parse(posts);
      posts.forEach(function(post) { %>*/}
        <div className="demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-cell--12-col-desktop">
          <div className="mdl-card__title mdl-card--expand mdl-color--yellow-300">
            <h2 className="mdl-card__title-text"> *post.post_title*' by '+ *post.screen_name* </h2>
          </div>
          <div className="mdl-card__supporting-text mdl-color-text--grey-600">
            *post body*
          </div>
          <div className="mdl-card__actions mdl-card--border">
            <a href="#" className="mdl-button mdl-js-button mdl-js-ripple-effect" data-upgraded=",MaterialButton,MaterialRipple">Read More<span className="mdl-button__ripple-container"><span className="mdl-ripple"></span></span></a>
          </div>
        </div>
      {/*<% }); %>*/}
  </div>
  ,
  document.getElementById('posts')
);

module.exports = Post;
