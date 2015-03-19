var createPool = require("create_pool"),
    consts = require("./consts");


module.exports = ReplacePatch;


function ReplacePatch() {
    this.type = consts.REPLACE;
    this.id = null;
    this.index = null;
    this.previous = null;
    this.current = null;
}
createPool(ReplacePatch);

ReplacePatch.create = function(id, index, previous, current) {
    var patch = ReplacePatch.getPooled();
    patch.id = id;
    patch.index = index;
    patch.previous = previous;
    patch.current = current;
    return patch;
};

ReplacePatch.prototype.destructor = function() {
    this.id = null;
    this.index = null;
    this.previous = null;
    this.current = null;
    return this;
};

ReplacePatch.prototype.destroy = function() {
    return ReplacePatch.release(this);
};
