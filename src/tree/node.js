var map = require("map"),
    forEach = require("for_each"),
    Patches = require("../patches"),
    diff = require("../diff"),
    View = require("../view"),
    getViewKey = require("../utils/get_view_key"),
    createNode;


var NodePrototype,
    isPrimativeView = View.isPrimativeView;


module.exports = Node;


createNode = require("./create_node");


function Node() {
    this.id = null;
    this.parent = null;
    this.root = null;
    this.children = {};
    this.instance = null;
}

NodePrototype = Node.prototype;

NodePrototype.add = function(node) {
    var id = node.id,
        children = this.children;

    if (children[id] === undefined) {
        node.parent = this;
        this.root.add(node);

        children[id] = node;
    }
};

NodePrototype.remove = function(node) {
    var id = node.id,
        children = this.children;

    if (children[id] !== undefined) {
        node.parent = null;
        this.root.remove(node);

        delete children[id];
    }
};

NodePrototype.mount = function() {
    this.root.renderer.mount(this.id, this._mountRender());
};

NodePrototype._mount = function() {
    var instance = this.instance;

    instance.componentWillMount();

    this.root.renderer.onMount(function() {
        instance.componentDidMount();
    });
};

NodePrototype._mountRender = function() {
    var _this = this,
        parentId = this.id,
        renderedView = this.instance.render();

    renderedView.children = map(renderedView.children, function(child, index) {
        var node, id;

        if (isPrimativeView(child)) {
            return child;
        } else {
            node = createNode(child);
            id = parentId + "." + getViewKey(child, index);

            node.id = id;
            _this.add(node);

            return node._mountRender();
        }
    });

    renderedView.__node = this;
    this.renderedView = renderedView;
    this._mount();

    return renderedView;
};

NodePrototype.unmount = function() {
    this._unmount();
    this.root.renderer.unmount(this.id);
};

NodePrototype._unmount = function() {

    forEach(this.renderedView.children, function(child, index) {
        if (!isPrimativeView(child)) {
            child.__node._unmount();
        }
    });

    this.instance.componentWillUnmount();
};

NodePrototype.update = function(nextView) {
    var patches = Patches.create();

    this._update(nextView, patches);
    this.root.renderer.update(this.id, patches);
};

NodePrototype._update = function(nextView, patches) {
    var instance = this.instance,
        nextProps = nextView.props,
        nextChildren = nextView.children,
        nextState = instance.state,
        renderedView = this.renderedView,
        previousProps, previousChildren, previousState;

    if (instance.shouldComponentUpdate(nextProps, nextChildren, nextState)) {

        diff(renderedView, nextView, patches, this.id);

        instance.componentWillReceiveProps(nextProps, nextChildren);
        instance.componentWillUpdate();

        previousProps = instance.props;
        previousChildren = instance.children;
        previousState = instance._previousState;

        this.root.renderer.onUpdate(function() {
            instance.componentDidUpdate(previousProps, previousChildren, previousState);
        });

        instance.props = nextProps;
        instance.children = nextChildren;
    }
};

