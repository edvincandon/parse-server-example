var friends = require("cloud/friends.js");

Parse.Cloud.define('addFriend', friends.addFriend(req, res));
