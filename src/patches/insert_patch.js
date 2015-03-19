var createPool = require("create_pool"),
    consts = require("./consts");


module.exports = InsertPatch;


function InsertPatch() {
    this.type = consts.INSERT;
    this.id = null;
    this.index = null;
    this.next = null;
}
createPool(InsertPatch);

InsertPatch.create = function(id, index, next) {
    var patch = InsertPatch.getPooled();
    patch.id = id;
    patch.index = index;
    patch.next = next;
    return patch;
};

InsertPatch.prototype.destructor = function() {
    this.id = null;
    this.index = null;
    this.next = null;
    return this;
};

InsertPatch.prototype.destroy = function() {
    return InsertPatch.release(this);
};
