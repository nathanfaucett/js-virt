var createPool = require("create_pool"),
    consts = require("./consts");


module.exports = RemovePatch;


function RemovePatch() {
    this.type = consts.REMOVE;
    this.id = null;
    this.previous = null;
}
createPool(RemovePatch);

RemovePatch.create = function(id, previous) {
    var patch = RemovePatch.getPooled();
    patch.id = id;
    patch.previous = previous;
    return patch;
};

RemovePatch.prototype.destructor = function() {
    this.id = null;
    this.previous = null;
    return this;
};

RemovePatch.prototype.destroy = function() {
    return RemovePatch.release(this);
};
