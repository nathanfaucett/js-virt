var createPool = require("create_pool"),
    Queue = require("queue"),
    consts = require("./consts"),
    InsertPatch = require("./insert_patch"),
    OrderPatch = require("./order_patch"),
    PropsPatch = require("./props_patch"),
    RemovePatch = require("./remove_patch"),
    ReplacePatch = require("./replace_patch"),
    TextPatch = require("./text_patch");


module.exports = Transaction;


function Transaction() {

    this.queue = Queue.getPooled();

    this.removeIds = [];
    this.removeHash = {};

    this.patchIds = [];
    this.patchHash = {};
}
createPool(Transaction);
Transaction.consts = consts;

Transaction.create = function() {
    return Transaction.getPooled();
};

Transaction.prototype.destroy = function() {
    Transaction.release(this);
};

function clearTransaction(ids, hash) {
    var i = -1,
        il = ids.length - 1,
        index, transaction, j, jl;

    while (i++ < il) {
        index = ids[i];
        transaction = hash[index];

        j = -1;
        jl = transaction.length - 1;
        while (j++ < jl) {
            transaction[j].destroy();
        }

        delete hash[index];
    }

    ids.length = 0;
}

Transaction.prototype.destructor = function() {
    clearTransaction(this.patchIds, this.patchHash);
    clearTransaction(this.removeIds, this.removeHash);
    return this;
};

Transaction.prototype.insert = function(id, childId, index, next) {
    return this.append(InsertPatch.create(id, childId, index, next));
};

Transaction.prototype.order = function(id, order) {
    return this.append(OrderPatch.create(id, order));
};

Transaction.prototype.props = function(id, previous, props) {
    return this.append(PropsPatch.create(id, previous, props));
};

Transaction.prototype.replace = function(id, childId, index, next) {
    return this.append(ReplacePatch.create(id, childId, index, next));
};

Transaction.prototype.text = function(id, index, next) {
    return this.append(TextPatch.create(id, index, next));
};

Transaction.prototype.remove = function(id, childId, index) {
    return this.appendRemove(RemovePatch.create(id, childId, index));
};

function append(ids, hash, value) {
    var id = value.id,
        patchArray = hash[id];

    if (!patchArray) {
        patchArray = hash[id] = [];
        ids[ids.length] = id;
    }

    patchArray[patchArray.length] = value;
}

Transaction.prototype.append = function(value) {
    append(this.patchIds, this.patchHash, value);
};

Transaction.prototype.appendRemove = function(value) {
    append(this.removeIds, this.removeHash, value);
};

Transaction.prototype.toJSON = function() {
    return {
        removeIds: this.removeIds,
        removeHash: this.removeHash,
        patchIds: this.patchIds,
        patchHash: this.patchHash
    };
};
