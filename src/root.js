var Patches = require("./patches"),
    shouldUpdate = require("./utils/should_update"),
    Node = require("./node");


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root() {

    this.id = "." + (ROOT_ID++).toString(36);
    this.childHash = {};
    this.adaptor = null;

    this.__transactions = [];
    this.__currentTransaction = null;
}

RootPrototype = Root.prototype;

RootPrototype.appendNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (childHash[id] === undefined) {
        node.root = this;
        childHash[id] = node;
    } else {
        throw new Error("Root appendNode(node) trying to override node at " + id);
    }
};

RootPrototype.removeNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (childHash[id] !== undefined) {
        node.parent = null;
        delete childHash[id];
    } else {
        throw new Error("Root removeNode(node) trying to remove node that does not exists with id " + id);
    }
};

RootPrototype.__handle = function() {
    var _this = this,
        transactions = this.__transactions,
        patches;

    if (transactions.length !== 0 && this.__currentTransaction === null) {
        this.__currentTransaction = patches = transactions.shift();

        this.adaptor.handle(patches, function() {

            patches.queue.notifyAll();
            patches.destroy();

            _this.__currentTransaction = null;
            _this.__handle();
        });
    }
};

RootPrototype.render = function(nextView, id) {
    var transactions = this.__transactions,
        patches = Patches.create(),
        node;

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.renderedView, nextView)) {

            node.update(nextView, patches);

            transactions[transactions.length] = patches;
            this.__handle();

            return;
        } else {
            node.unmount(patches);
        }
    }

    node = Node.create(nextView);
    node.id = id;
    this.appendNode(node);
    node.mount(patches);

    transactions[transactions.length] = patches;
    this.__handle();
};
