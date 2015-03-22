var createPool = require("create_pool"),
    consts = require("./consts"),
    InsertPatch = require("./insert_patch"),
    OrderPatch = require("./order_patch"),
    PropsPatch = require("./props_patch"),
    RemovePatch = require("./remove_patch"),
    ReplacePatch = require("./replace_patch"),
    TextPatch = require("./text_patch");


module.exports = Patches;


function Patches() {
    this.ids = [];
    this.hash = null;
}
createPool(Patches);
Patches.consts = consts;

Patches.create = function() {
    return Patches.getPooled().construct();
};

Patches.prototype.destroy = function() {
    Patches.release(this);
};

Patches.prototype.construct = function() {
    var ids = this.ids;

    this.hash = {};
    if (ids.length !== 0) {
        ids.length = 0;
    }

    return this;
};

Patches.prototype.destructor = function() {
    var hash = this.hash,
        ids = this.ids,
        i = -1,
        il = ids.length - 1,
        index, patches, j, jl;

    while (i++ < il) {
        index = ids[i];
        patches = hash[index];

        j = -1;
        jl = patches.length - 1;
        while (j++ < jl) {
            patches[j].destroy();
        }
    }

    this.hash = null;
    this.ids.length = 0;

    return this;
};

Patches.prototype.insert = function(id, index, next) {
    return this.append(InsertPatch.create(id, index, next));
};

Patches.prototype.order = function(id, order) {
    return this.append(OrderPatch.create(id, order));
};

Patches.prototype.props = function(id, previous, props) {
    return this.append(PropsPatch.create(id, previous, props));
};

Patches.prototype.remove = function(id, previous) {
    return this.append(RemovePatch.create(id, previous));
};

Patches.prototype.replace = function(id, index, previous, next) {
    return this.append(ReplacePatch.create(id, index, previous, next));
};

Patches.prototype.text = function(id, index, text) {
    return this.append(TextPatch.create(id, index, text));
};

Patches.prototype.append = function(value) {
    var id = value.id,
        ids = this.ids,
        hash = this.hash,
        patchArray = hash[id];

    if (!patchArray) {
        patchArray = hash[id] = [];
        ids[ids.length] = id;
    }
    patchArray[patchArray.length] = value;

    return this;
};
