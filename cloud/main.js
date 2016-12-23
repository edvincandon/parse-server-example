var friends = require("./friends.js");

Parse.Cloud.define('addFriend', function(req, res){ friends.addFriend(req, res) });
