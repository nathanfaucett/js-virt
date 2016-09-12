var consts = require("./consts");


module.exports = UnmountPatch;


function UnmountPatch(id) {
    this.type = consts.UNMOUNT;
    this.id = id;
}