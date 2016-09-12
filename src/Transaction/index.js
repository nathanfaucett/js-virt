var Queue = require("@nathanfaucett/queue"),
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

    this.queue = new Queue();

    this.removes = {};
    this.patches = {};

    this.events = {};
    this.eventsRemove = {};
}

Transaction.consts = consts;
TransactionPrototype = Transaction.prototype;

TransactionPrototype.mount = function(id, next) {
    this.append(new MountPatch(id, next));
};

TransactionPrototype.unmount = function(id) {
    this.append(new UnmountPatch(id));
};

TransactionPrototype.insert = function(id, childId, index, next) {
    this.append(new InsertPatch(id, childId, index, next));
};

TransactionPrototype.order = function(id, order) {
    this.append(new OrderPatch(id, order));
};

TransactionPrototype.props = function(id, previous, props) {
    this.append(new PropsPatch(id, previous, props));
};

TransactionPrototype.replace = function(id, childId, index, next) {
    this.append(new ReplacePatch(id, childId, index, next));
};

TransactionPrototype.text = function(id, index, next, props) {
    this.append(new TextPatch(id, index, next, props));
};

TransactionPrototype.remove = function(id, childId, index) {
    this.appendRemove(new RemovePatch(id, childId, index));
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

function append(hash, value) {
    var id = value.id,
        patchArray = hash[id] || (hash[id] = []);

    patchArray[patchArray.length] = value;
}

TransactionPrototype.append = function(value) {
    append(this.patches, value);
};

TransactionPrototype.appendRemove = function(value) {
    append(this.removes, value);
};

TransactionPrototype.toJSON = function() {
    return {
        removes: this.removes,
        patches: this.patches,
        events: this.events,
        eventsRemove: this.eventsRemove
    };
};