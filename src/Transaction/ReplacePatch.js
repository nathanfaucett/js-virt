var consts = require("./consts");


module.exports = ReplacePatch;


function ReplacePatch(id, childId, index, next) {
    this.type = consts.REPLACE;
    this.id = id;
    this.childId = childId;
    this.index = index;
    this.next = next;
}