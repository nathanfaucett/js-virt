var consts = require("./consts");


module.exports = InsertPatch;


function InsertPatch(id, childId, index, next) {
    this.type = consts.INSERT;
    this.id = id;
    this.childId = childId;
    this.index = index;
    this.next = next;
}