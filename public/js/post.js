$('.like-post').click(function(e){
  $(this).toggleClass('liked');
  console.log($(this).closest('.post').data('post-id'));

  likePost($(this).closest('.post').data('post-id'), $(this).hasClass('liked'));
});

function likePost(postId, shouldLike) {
  var postRequest = new XMLHttpRequest();   // new HttpRequest instance
  postRequest.open('POST', '/post/likePost', true);
  postRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  postRequest.send(JSON.stringify({"postId":postId, "shouldLike": shouldLike}));

  postRequest.onreadystatechange = function() {
    if(postRequest.readyState == 4 && postRequest.status == 200) {
      var status = JSON.parse(postRequest.response).status;
      console.log(status);
      if(status=='success') {
        console.log('UPDATED LIKE!!!!');
      }
    }
  }
}
