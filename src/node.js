var indexOf = require("index_of"),
    map = require("map"),
    forEach = require("for_each"),
    isFunction = require("is_function"),
    getComponentClassForType = require("./utils/get_component_class_for_type"),
    Patches = require("./patches"),
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

NodePrototype.removeNode = function(node) {
    var children = this.children,
        nodeChildren = node.children,
        i = -1,
        il = nodeChildren.length - 1;

    while (i++ < il) {
        node.removeNode(nodeChildren[i]);
    }

    node.parent = null;
    children.splice(indexOf(children, node), 1);
    this.root.removeNode(node);
};

NodePrototype.mount = function(index) {
    this.root.mount(this.parent ? this.parent.id : null, this.id, index || 0, this.__mount());
};

NodePrototype.__mount = function() {
    var _this = this,
        parentId = this.id,
        component = this.component,
        renderedView = this.render();

    renderedView.children = map(renderedView.children, function(child, index) {
        var node;

        if (isPrimativeView(child)) {
            return child;
        } else {
            node = Node.create(child);
            node.id = parentId + "." + getViewKey(child, index);
            _this.appendNode(node);

            return node.__mount();
        }
    });

    this.renderedView = renderedView;

    component.componentWillMount();

    this.root.onMount(function onMount() {
        component.componentDidMount();
    });

    return renderedView;
};

NodePrototype.unmount = function() {

    this.__unmount();

    if (this.parent !== null) {
        this.parent.removeNode(this);
    } else {
        this.root.removeNode(this);
    }

    this.root.unmount(this.parent ? this.parent.id : null, this.id);
};

NodePrototype.__unmount = function() {
    var component = this.component;

    component.componentWillUnmount();

    this.root.onUnmount(function onUnmount() {
        component.componentDidUnmount();
    });
};

NodePrototype.update = function(nextView) {
    var patches = Patches.create();

    this.__update(nextView, patches);
    this.root.update(patches);
};

diff = require("./diff");

NodePrototype.__update = function(nextView, patches) {
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
        diff(this.root, this, this.renderedView, renderedView, patches, this.id);
        this.renderedView = renderedView;
    } else {
        component.props = nextProps;
        component.children = nextChildren;
    }

    this.root.onUpdate(function onUpdate() {
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
