var traversePath = require("./traversePath");


module.exports = traverseTwoPhase;


function traverseTwoPhase(id, callback) {
    if (id) {
        traversePath(id, "", callback, false, true);
        traversePath("", id, callback, true, false);
    }
}
