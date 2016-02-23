var isFunction = require("is_function"),
    isNull = require("is_null"),
    isUndefined = require("is_undefined"),
    emptyFunction = require("empty_function"),
    Transaction = require("./Transaction"),
    diffProps = require("./utils/diffProps"),
    shouldUpdate = require("./utils/shouldUpdate"),
    EventManager = require("./EventManager"),
    Node = require("./Node");


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root() {

    this.id = "." + (ROOT_ID++).toString(36);
    this.childHash = {};

    this.eventManager = new EventManager();

    this.nativeComponents = {};
    this.diffProps = diffProps;
    this.adapter = null;

    this.__transactions = [];
    this.__transactionCallbacks = [];
    this.__currentTransaction = null;
}
RootPrototype = Root.prototype;

RootPrototype.registerNativeComponent = function(type, constructor) {
    this.nativeComponents[type] = constructor;
};

RootPrototype.appendNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (isUndefined(childHash[id])) {
        node.root = this;
        childHash[id] = node;
    } else {
        throw new Error("Root appendNode(node) trying to override node at " + id);
    }
};

RootPrototype.removeNode = function(node) {
    var id = node.id,
        childHash = this.childHash;

    if (!isUndefined(childHash[id])) {
        node.root = null;
        delete childHash[id];
    } else {
        throw new Error("Root removeNode(node) trying to remove node that does not exists with id " + id);
    }
};

RootPrototype.__processTransaction = function() {
    var _this = this,
        transactions = this.__transactions,
        transactionCallbacks = this.__transactionCallbacks,
        transaction, callback;

    if (isNull(this.__currentTransaction) && transactions.length !== 0) {
        this.__currentTransaction = transaction = transactions[0];
        callback = transactionCallbacks[0];

        this.adapter.messenger.emit("virt.handleTransaction", transaction, function onHandleTransaction() {
            transactions.splice(0, 1);
            transactionCallbacks.splice(0, 1);

            transaction.queue.notifyAll();
            transaction.destroy();

            _this.__currentTransaction = null;

            callback();

            if (transactions.length !== 0) {
                _this.__processTransaction();
            }
        });
    }
};

RootPrototype.__enqueueTransaction = function(transaction, callback) {
    var transactions = this.__transactions,
        index = transactions.length;

    transactions[index] = transaction;
    this.__transactionCallbacks[index] = isFunction(callback) ? callback : emptyFunction;
    this.__processTransaction();
};

RootPrototype.unmount = function(callback) {
    var node = this.childHash[this.id],
        transaction;

    if (node) {
        transaction = Transaction.create();

        transaction.unmount(this.id);
        node.__unmount(transaction);

        this.__enqueueTransaction(transaction, callback);
    }
};

RootPrototype.update = function(node, callback) {
    var transaction = Transaction.create();

    node.update(node.currentView, transaction);

    this.__enqueueTransaction(transaction, callback);
};

RootPrototype.render = function(nextView, id, callback) {
    var transaction = Transaction.create(),
        node;

    if (isFunction(id)) {
        callback = id;
        id = null;
    }

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.currentView, nextView)) {

            node.update(nextView, transaction);
            this.__enqueueTransaction(transaction, callback);

            return this;
        } else {
            if (this.id === id) {
                node.__unmount(transaction);
                transaction.unmount(id);
            } else {
                node.unmount(transaction);
            }
        }
    }

    node = new Node(this.id, id, nextView);
    this.appendNode(node);
    node.mount(transaction);

    this.__enqueueTransaction(transaction, callback);

    return this;
};
