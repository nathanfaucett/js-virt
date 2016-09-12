var consts = require("./consts");


module.exports = RemovePatch;


function RemovePatch(id, childId, index) {
    this.type = consts.REMOVE;
    this.id = id;
    this.childId = childId;
    this.index = index;
}