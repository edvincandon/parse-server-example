var friends = require("./friends.js");

Parse.Cloud.define('addFriend', friends.addFriend(req, res));
