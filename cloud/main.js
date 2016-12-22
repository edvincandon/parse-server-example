
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('addFriend', function(req, res) {
  // check if request exists on other end -> toUser = req.fromUser
  // if exists set it to status APPROVED
  var User = Parse.Object.extend('User');
  var Request = Parse.Object.extend('Request');

  var originUser = req.user;
  var targetUserID = req.params.toUser;
  var targetUser = new User();
  targerUser.id = targetUserID;


  var friendRequest = new Request();
  friendRequest.save({
    fromUser: originUser,
    toUser: targetUser
    }, {
      success: function(result) {
        res.success(result);
      },
      error: function(result, error) {
        res.error(error);
      }
  });

});
