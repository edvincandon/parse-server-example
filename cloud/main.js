/**
  * FRIEND REQUEST HANDLING
  * Cloud code function addFriend
  * BeforeSave for Request Object
*/

Parse.Cloud.define('addFriend', function(req, res) {
  // check if request exists on other end -> toUser = req.fromUser
  // if exists set it to status APPROVED
  var User = Parse.Object.extend('User');
  var Request = Parse.Object.extend('Request');

  var originUser = req.user;
  var targetUserID = req.params.toUser;
  var targetUser = new User();
  targetUser.id = targetUserID;

  checkIfRequestExists(originUser, targetUser).then(function(){
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
  }).catch(function(){
    res.error();
  });

});

var checkIfRequestExists = function(_fromUser, _toUser){
  var promise = new Parse.Promise();
  var query = new Parse.Query('Request');
  query.equalTo('fromUser', _fromUser);
  query.equalTo('toUser', _toUser);
  query.count({
    success: function(count){
      if (count > 0) {
        promise.reject();
      } else {
        promise.resolve();
      }
    }
  });
  return promise;
}
