var friends = require("cloud/main.js");

Parse.Cloud.define('addFriend', friends.addFriend(req, res));
