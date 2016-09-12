var isFunction = require("@nathanfaucett/is_function"),
    isNull = require("@nathanfaucett/is_null"),
    isUndefined = require("@nathanfaucett/is_undefined"),
    emptyFunction = require("@nathanfaucett/empty_function"),
    Transaction = require("./Transaction"),
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

            _this.__currentTransaction = null;

            transactions.splice(0, 1);
            transactionCallbacks.splice(0, 1);

            transaction.queue.notifyAll();

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
        transaction = new Transaction();

        transaction.unmount(this.id);
        node.__unmount(transaction);

        this.__enqueueTransaction(transaction, callback);
    }
};

RootPrototype.update = function(node, state, callback) {
    var transaction = new Transaction();

    node.update(node.currentView, state, transaction);
    this.__enqueueTransaction(transaction, callback);
};

RootPrototype.forceUpdate = function(node, callback) {
    var transaction = new Transaction();

    node.forceUpdate(node.currentView, transaction);
    this.__enqueueTransaction(transaction, callback);
};

RootPrototype.enqueueUpdate = function(node, nextState, callback) {
    var _this = this,
        transaction = this.__currentTransaction;

    if (!isNull(transaction)) {
        transaction.queue.enqueue(function onHandleTransaction() {
            if (!isUndefined(_this.childHash[node.id])) {
                _this.update(node, nextState, callback);
            }
        });
    } else {
        process.nextTick(function onNextTick() {
            _this.update(node, nextState, callback);
        });
    }
};

RootPrototype.render = function(nextView, id, callback) {
    var transaction = new Transaction(),
        node;

    if (isFunction(id)) {
        callback = id;
        id = null;
    }

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.currentView, nextView)) {

            node.forceUpdate(nextView, transaction);
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