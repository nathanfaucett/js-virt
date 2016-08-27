var traversePath = require("./traversePath");


module.exports = traverseDescendant;


function traverseDescendant(id, callback) {
    traversePath("", id, callback, true, false);
}