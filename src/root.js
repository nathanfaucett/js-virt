var Transaction = require("./transaction"),
    shouldUpdate = require("./utils/should_update"),
    EventManager = require("./event_manager"),
    Node = require("./node");


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root() {

    this.id = "." + (ROOT_ID++).toString(36);
    this.childHash = {};

    this.eventManager = new EventManager();

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

RootPrototype.__processTransaction = function() {
    var _this = this,
        transactions = this.__transactions,
        transaction;

    if (this.__currentTransaction === null && transactions.length !== 0) {
        this.__currentTransaction = transaction = transactions[0];

        this.adaptor.handle(transaction, function() {
            transactions.splice(0, 1);

            transaction.queue.notifyAll();
            transaction.destroy();

            _this.__currentTransaction = null;

            if (transactions.length !== 0) {
                _this.__processTransaction();
            }
        });
    }
};

RootPrototype.__enqueueTransaction = function(transaction) {
    var transactions = this.__transactions;
    transactions[transactions.length] = transaction;
};

RootPrototype.update = function(node) {
    var transaction = Transaction.create(),
        component = node.component,
        renderedView = node.renderedView,
        currentView = node.currentView;

    node.__update(
        component.props, renderedView.props,
        component.children, renderedView.children,
        component.__previousState, component.state,
        currentView,
        transaction
    );

    this.__enqueueTransaction(transaction);
    this.__processTransaction();
};

RootPrototype.render = function(nextView, id) {
    var transaction = Transaction.create(),
        node;

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.renderedView, nextView)) {

            node.update(nextView, transaction);
            this.__enqueueTransaction(transaction);
            this.__processTransaction();

            return;
        } else {
            node.unmount(transaction);
        }
    }

    node = Node.create(nextView);
    node.id = id;
    this.appendNode(node);
    node.mount(transaction);

    this.__enqueueTransaction(transaction);
    this.__processTransaction();
};