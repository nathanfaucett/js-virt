var traversePath = require("./traversePath");


module.exports = traverseAncestors;


function traverseAncestors(id, callback) {
    traversePath("", id, callback, true, false);
}
