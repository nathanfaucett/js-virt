var createPool = require("create_pool"),
    consts = require("./consts");


module.exports = MountPatch;


function MountPatch() {
    this.type = consts.MOUNT;
    this.id = null;
    this.next = null;
}
createPool(MountPatch);

MountPatch.create = function(id, next) {
    var patch = MountPatch.getPooled();
    patch.id = id;
    patch.next = next;
    return patch;
};

MountPatch.prototype.destructor = function() {
    this.id = null;
    this.next = null;
    return this;
};

MountPatch.prototype.destroy = function() {
    return MountPatch.release(this);
};
