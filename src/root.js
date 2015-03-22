var indexOf = require("index_of"),
    shouldUpdate = require("./utils/should_update"),
    Node = require("./node");


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root() {

    this.id = "." + (ROOT_ID++).toString(36);
    this.childHash = {};

    this.adaptor = null;

    this.__mountQueue = [];
    this.__unmountQueue = [];
    this.__updateQueue = [];
}

RootPrototype = Root.prototype;

RootPrototype.appendNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (childHash[id] === undefined) {
        node.root = this;
        childHash[id] = node;
    } else {
        throw new Error("Root add(node) trying to override node at " + id);
    }
};

RootPrototype.removeNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (childHash[id] !== undefined) {
        node.parent = null;
        delete childHash[id];
    } else {
        throw new Error("Root remove(node) trying to remove node that does not exists with id " + id);
    }
};

RootPrototype.onMount = function(callback) {
    var queue = this.__mountQueue;
    queue[queue.length] = callback;
};

RootPrototype.onUnmount = function(callback) {
    var queue = this.__unmountQueue;
    queue[queue.length] = callback;
};

RootPrototype.onUpdate = function(callback) {
    var queue = this.__updateQueue;
    queue[queue.length] = callback;
};

RootPrototype.notifyMount = function() {
    var queue = this.__mountQueue,
        i = -1,
        il = queue.length - 1;

    while (i++ < il) {
        queue[i]();
    }
    queue.length = 0;
};

RootPrototype.notifyUnmount = function() {
    var queue = this.__unmountQueue,
        i = -1,
        il = queue.length - 1;

    while (i++ < il) {
        queue[i]();
    }
    queue.length = 0;
};

RootPrototype.notifyUpdate = function() {
    var queue = this.__updateQueue,
        i = -1,
        il = queue.length - 1;

    while (i++ < il) {
        queue[i]();
    }
    queue.length = 0;
};

RootPrototype.mount = function(parentId, id, index, view) {
    var _this = this;

    this.adaptor.mount(parentId, id, index, view, function() {
        _this.notifyMount();
    });
};

RootPrototype.unmount = function(parentId, id) {
    var _this = this;

    this.adaptor.unmount(parentId, id, function() {
        _this.notifyUnmount();
    });
};

RootPrototype.update = function(patches) {
    var _this = this;

    this.adaptor.update(patches, function() {
        _this.notifyUpdate();
    });
};

RootPrototype.render = function(nextView, id) {
    var node;

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.renderedView, nextView)) {
            node.update(nextView);
            return;
        } else {
            node.unmount();
        }
    }

    node = Node.create(nextView);
    node.id = id;
    this.appendNode(node);
    node.mount();
};
