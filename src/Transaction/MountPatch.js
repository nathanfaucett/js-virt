var consts = require("./consts");


module.exports = MountPatch;


function MountPatch(id, next) {
    this.type = consts.MOUNT;
    this.id = id;
    this.next = next;
}