var Transaction = require("./transaction"),
    shouldUpdate = require("./utils/should_update"),
    EventManager = require("./event/event_manager"),
    Node = require("./node");


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root(adaptor) {

    this.id = "." + (ROOT_ID++).toString(36);
    this.childHash = {};

    this.eventManager = new EventManager(this);

    this.adaptor = adaptor;
    adaptor.root = this;

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

RootPrototype.handleEvent = function(id, type, event) {
    this.eventManager.emit(id, type, event);
};

RootPrototype.handle = function() {
    var _this = this,
        transactions = this.__transactions,
        transaction;

    if (this.__currentTransaction === null && transactions.length !== 0) {
        this.__currentTransaction = transaction = transactions.shift();

        this.adaptor.handle(transaction, function() {

            transaction.queue.notifyAll();
            transaction.destroy();

            _this.__currentTransaction = null;
            _this.handle();
        });
    }
};

RootPrototype.update = function(node) {
    var transactions = this.__transactions,
        transaction = Transaction.create(),

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

    transactions[transactions.length] = transaction;
    this.handle();
};

RootPrototype.render = function(nextView, id) {
    var transactions = this.__transactions,
        transaction = Transaction.create(),
        node;

    id = id || this.id;
    node = this.childHash[id];

    if (node) {
        if (shouldUpdate(node.renderedView, nextView)) {

            node.update(nextView, transaction);

            transactions[transactions.length] = transaction;
            this.handle();

            return;
        } else {
            node.unmount(transaction);
        }
    }

    node = Node.create(nextView);
    node.id = id;
    this.appendNode(node);
    node.mount(transaction);

    transactions[transactions.length] = transaction;
    this.handle();
};
