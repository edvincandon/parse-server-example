var friends = require("./friends.js");

Parse.Cloud.define('addFriend', function(req, res){ friends.addFriend(req, res) });
Parse.Cloud.define('getAllRequests', function(req, res){ friends.getAllRequests(req, res) });
