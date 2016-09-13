var createPool = require("@nathanfaucett/create_pool"),
    Queue = require("@nathanfaucett/queue"),
    arrayForEach = require("@nathanfaucett/array-for_each"),
    consts = require("./consts"),
    InsertPatch = require("./InsertPatch"),
    MountPatch = require("./MountPatch"),
    UnmountPatch = require("./UnmountPatch"),
    OrderPatch = require("./OrderPatch"),
    PropsPatch = require("./PropsPatch"),
    RemovePatch = require("./RemovePatch"),
    ReplacePatch = require("./ReplacePatch"),
    TextPatch = require("./TextPatch");


var TransactionPrototype;


module.exports = Transaction;


function Transaction() {

    this.queue = Queue.getPooled();

    this.removes = {};
    this.patches = {};
    this.__removesArray = [];
    this.__patchesArray = [];

    this.events = {};
    this.eventsRemove = {};
}
createPool(Transaction);
Transaction.consts = consts;
TransactionPrototype = Transaction.prototype;

Transaction.create = function() {
    return Transaction.getPooled();
};

TransactionPrototype.destroy = function() {
    Transaction.release(this);
};

TransactionPrototype.destructor = function() {

    arrayForEach(this.__patchesArray, destroyPatchArray);
    arrayForEach(this.__removesArray, destroyPatchArray);

    this.removes = {};
    this.patches = {};
    this.__removesArray.length = 0;
    this.__patchesArray.length = 0;

    this.events = {};
    this.eventsRemove = {};

    return this;
};

function destroyPatchArray(array) {
    arrayForEach(array, destroyPatch);
}

function destroyPatch(patch) {
    patch.destroy();
}

TransactionPrototype.mount = function(id, next) {
    this.append(MountPatch.create(id, next));
};

TransactionPrototype.unmount = function(id) {
    this.append(UnmountPatch.create(id));
};

TransactionPrototype.insert = function(id, childId, index, next) {
    this.append(InsertPatch.create(id, childId, index, next));
};

TransactionPrototype.order = function(id, order) {
    this.append(OrderPatch.create(id, order));
};

TransactionPrototype.props = function(id, previous, props) {
    this.append(PropsPatch.create(id, previous, props));
};

TransactionPrototype.replace = function(id, childId, index, next) {
    this.append(ReplacePatch.create(id, childId, index, next));
};

TransactionPrototype.text = function(id, index, next, props) {
    this.append(TextPatch.create(id, index, next, props));
};

TransactionPrototype.remove = function(id, childId, index) {
    this.appendRemove(RemovePatch.create(id, childId, index));
};

TransactionPrototype.event = function(id, type) {
    var events = this.events,
        eventArray = events[id] || (events[id] = []);

    eventArray[eventArray.length] = type;
};

TransactionPrototype.removeEvent = function(id, type) {
    var eventsRemove = this.eventsRemove,
        eventArray = eventsRemove[id] || (eventsRemove[id] = []);

    eventArray[eventArray.length] = type;
};

function append(hash, array, value) {
    var id = value.id,
        patchArray = hash[id];

    if (!(patchArray = hash[id])) {
        patchArray = hash[id] = array[array.length] = [];
    }

    patchArray[patchArray.length] = value;
}

TransactionPrototype.append = function(value) {
    append(this.patches, this.__patchesArray, value);
};

TransactionPrototype.appendRemove = function(value) {
    append(this.removes, this.__removesArray, value);
};

TransactionPrototype.toJSON = function() {
    return {
        removes: this.removes,
        patches: this.patches,
        events: this.events,
        eventsRemove: this.eventsRemove
    };
};