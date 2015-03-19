var createPool = require("create_pool"),
    consts = require("./consts");


module.exports = TextPatch;


function TextPatch() {
    this.type = consts.TEXT;
    this.id = null;
    this.index = null;
    this.next = null;
}
createPool(TextPatch);

TextPatch.create = function(id, index, next) {
    var patch = TextPatch.getPooled();
    patch.id = id;
    patch.index = index;
    patch.next = next;
    return patch;
};

TextPatch.prototype.destructor = function() {
    this.id = null;
    this.index = null;
    this.next = null;
    return this;
};

TextPatch.prototype.destroy = function() {
    return TextPatch.release(this);
};
