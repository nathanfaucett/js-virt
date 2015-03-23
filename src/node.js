var indexOf = require("index_of"),
    map = require("map"),
    isFunction = require("is_function"),
    getComponentClassForType = require("./utils/get_component_class_for_type"),
    View = require("./view"),
    getViewKey = require("./utils/get_view_key"),
    diff;


var NodePrototype,
    isPrimativeView = View.isPrimativeView;


module.exports = Node;


function Node() {
    this.id = null;
    this.parent = null;
    this.children = [];
    this.root = null;
    this.component = null;
    this.currentView = null;
}

NodePrototype = Node.prototype;

Node.create = function(view) {
    var node = new Node(),
        Class, component;

    if (isFunction(view.type)) {
        Class = view.type;
    } else {
        Class = getComponentClassForType(view.type);
    }

    component = new Class(view.props, view.children);
    component.__node = node;
    node.component = component;
    node.currentView = view;

    return node;
};

NodePrototype.appendNode = function(node) {
    var children = this.children;

    node.parent = this;
    children[children.length] = node;
    this.root.appendNode(node);
};

NodePrototype.removeNode = function(node, patches) {
    var children = this.children,
        nodeChildren = node.children,
        i = -1,
        il = nodeChildren.length - 1;

    while (i++ < il) {
        node.removeNode(nodeChildren[i], patches);
    }

    node.__unmount(patches);
    node.parent = null;
    children.splice(indexOf(children, node), 1);
    this.root.removeNode(node);
};

NodePrototype.mount = function(patches) {
    patches.insert(this.parent ? this.parent.id : this.id, this.id, 0, this.__renderRecurse(patches));
};

NodePrototype.__mount = function(patches) {
    var component = this.component;

    component.componentWillMount();

    patches.queue.enqueue(function onMount() {
        component.componentDidMount();
    });
};

NodePrototype.__renderRecurse = function(patches) {
    var _this = this,
        parentId = this.id,
        renderedView = this.render();

    renderedView.children = map(renderedView.children, function(child, index) {
        var node;

        if (isPrimativeView(child)) {
            return child;
        } else {
            node = Node.create(child);
            node.id = parentId + "." + getViewKey(child, index);
            _this.appendNode(node);

            return node.__renderRecurse(patches);
        }
    });

    this.renderedView = renderedView;
    this.__mount(patches);

    return renderedView;
};

NodePrototype.unmount = function(patches) {
    var parentId = this.parent ? this.parent.id : this.id;

    if (this.parent !== null) {
        this.parent.removeNode(this, patches);
    } else {
        this.root.removeNode(this);
    }

    patches.remove(parentId, this.id, 0);
};

NodePrototype.__unmount = function(patches) {
    var component = this.component;

    component.componentWillUnmount();

    patches.queue.enqueue(function onUnmount() {
        component.componentDidUnmount();
    });
};

diff = require("./diff");

NodePrototype.update = function(nextView, patches) {
    var component = this.component,

        nextState = component.state,
        nextProps = nextView.props,
        nextChildren = nextView.children,

        previousProps = component.props,
        previousChildren = component.children,
        previousState = component.__previousState,

        renderedView;

    component.componentWillReceiveProps(nextProps, nextChildren);

    if (component.shouldComponentUpdate(nextProps, nextChildren, nextState)) {

        component.props = nextProps;
        component.children = nextChildren;

        component.componentWillUpdate();

        renderedView = this.render();
        diff(this, this.renderedView, renderedView, patches);
        this.renderedView = renderedView;
    } else {
        component.props = nextProps;
        component.children = nextChildren;
    }

    patches.queue.enqueue(function onUpdate() {
        component.componentDidUpdate(previousProps, previousChildren, previousState);
    });
};

NodePrototype.render = function() {
    var currentView = this.currentView,
        renderedView = this.component.render();

    renderedView.key = currentView.key;
    renderedView.ref = currentView.ref;

    return renderedView;
};
