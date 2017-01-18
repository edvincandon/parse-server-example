/**
  * FRIEND REQUEST HANDLING
  * Cloud code function addFriend
  * BeforeSave for Request Object
*/
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

var checkIfRequestExistsOnOtherEnd = function(_fromUser, _toUser){
  var promise = new Parse.Promise();
  var query = new Parse.Query('Request');
  query.equalTo('toUser', _fromUser);
  query.equalTo('fromUser', _toUser);
  query.find({
    success: function(result){
      // if exists, result.length == 1
      if(result.length > 0){
        var symmetricalRequest = result[0];
        promise.resolve({hasSymmetricalRequest: true, symmetricalRequest: symmetricalRequest});
      } else {
        promise.resolve({hasSymmetricalRequest: false});
      }
    },
    error: function(){
      promise.reject();
    }
  });
  return promise;
}

exports.addFriend = function(req, res) {
  // check if request exists on other end -> toUser = req.fromUser
  // if exists set it to status APPROVED
  var User = Parse.Object.extend('User');
  var Request = Parse.Object.extend('Request');

  var originUser = req.user;
  var targetUserID = req.params.toUser;
  var targetUser = new User();
  targetUser.id = targetUserID;
  checkIfRequestExists(originUser, targetUser).then(function(){
    checkIfRequestExistsOnOtherEnd(originUser, targetUser).then(function(sym){
      var status = (sym.hasSymmetricalRequest) ? 1 : 0;
      var friendRequest = new Request();
      friendRequest.save({
        fromUser: originUser,
        toUser: targetUser,
        status: status,
        }, {
          success: function(result) {
            var data = mapRequest(result, 'toUser');
            if(sym.hasSymmetricalRequest){
              var symmetricalRequest = sym.symmetricalRequest;
              symmetricalRequest.save({
                status: 1
              }, {
                success: function(){
                  res.success(data);
                },
                error: function(error){
                  res.error(error);
                }
              })
            } else {
              res.success(data);
            }
          },
          error: function(result, error) {
            res.error(error);
          }
      });
    }).catch(function(){
      res.error('Something went wrong');
    });
  }).catch(function(){
    res.error('Request already exists');
  });
}

var getFromUserRequests = function(req, res){
  var promise = new Parse.Promise();
  var query = new Parse.Query('Request');
  query.equalTo('fromUser', req.user);
  query.include('toUser');
  query.find({
      success: function(result){
        var data = mapRequest(result, 'toUser');
        promise.resolve(data);
      },
      error: function(result, error){
        promise.reject(error);
      },
    });
  return promise;
}

var getToUserRequests = function(req, res){
  var promise = new Parse.Promise();
  var query = new Parse.Query('Request');
  query.equalTo('toUser', req.user);
  query.include('fromUser');
  query.equalTo('status', 0);
  query.find({
      success: function(result){
        var data = mapRequest(result, 'fromUser');
        promise.resolve(data);
      },
      error: function(result, error){
        promise.reject(error);
      },
    });
  return promise;
}

var mapRequest = function(arrayOfRequests, _include){
  var data = arrayOfRequests.map(function(map){
    var fromUser = map.get('fromUser');
    var toUser = map.get('toUser');
    if (_include === 'fromUser'){
      return {
        id: map.id,
        status: map.get('status'),
        fromUsername: fromUser.get('specialUsername'),
        fromUserID: fromUser.id,
      }
    } else if(_include === 'toUser'){
      return {
        id: map.id,
        status: map.get('status'),
        toUsername: toUser.get('specialUsername'),
        toUserID: toUser.id,
      }
    }
  });
  return data;
}


exports.getAllRequests = function(req, res){
  // get friends, sent requests, received requests
  var fromUserRequests = getFromUserRequests(req, res);
  var toUserRequests = getToUserRequests(req, res);
  Parse.Promise.when(fromUserRequests, toUserRequests).then(function(dataFrom, dataTo) {
    res.success({fromUserRequests: dataFrom, toUserRequests: dataTo});
  }).catch(function(error){
    res.error(error);
  });
}
