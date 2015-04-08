var createPool = require("create_pool"),
    consts = require("./consts");


module.exports = UnmountPatch;


function UnmountPatch() {
    this.type = consts.MOUNT;
    this.id = null;
}
createPool(UnmountPatch);

UnmountPatch.create = function(id) {
    var patch = UnmountPatch.getPooled();
    patch.id = id;
    return patch;
};

UnmountPatch.prototype.destructor = function() {
    this.id = null;
    return this;
};

UnmountPatch.prototype.destroy = function() {
    return UnmountPatch.release(this);
};
