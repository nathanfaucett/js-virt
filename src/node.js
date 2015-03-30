var has = require("has"),
    map = require("map"),
    indexOf = require("index_of"),
    isString = require("is_string"),
    isFunction = require("is_function"),
    owner = require("./owner"),
    componentState = require("./utils/component_state"),
    getComponentClassForType = require("./utils/get_component_class_for_type"),
    View = require("./view"),
    getViewKey = require("./utils/get_view_key"),
    emptyObject = require("./utils/empty_object"),
    diff;


var NodePrototype,
    isPrimativeView = View.isPrimativeView;


module.exports = Node;


function Node() {
    this.id = null;

    this.parent = null;
    this.children = [];
    this.root = null;

    this.ComponentClass = null;
    this.component = null;

    this.renderedView = null;
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
    node.ComponentClass = Class;
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

NodePrototype.removeNode = function(node, transaction) {
    var children = this.children;

    node.removeChildren(transaction);
    node.__unmount(transaction);
    node.parent = null;
    children.splice(indexOf(children, node), 1);
    this.root.removeNode(node);
};

NodePrototype.removeChildren = function(transaction) {
    var children = this.children,
        i = -1,
        il = children.length - 1;

    while (i++ < il) {
        this.removeNode(children[i], transaction);
    }
};

NodePrototype.mount = function(transaction) {
    transaction.insert(this.parent ? this.parent.id : this.id, this.id, 0, this.__renderRecurse(transaction));
};

NodePrototype.__mount = function(transaction) {
    var component = this.component,
        renderedView = this.renderedView;

    mountEvents(this.id, renderedView.props, this.root.eventManager, transaction);

    component.__mountState = componentState.MOUNTING;
    component.componentWillMount();


    transaction.queue.enqueue(function onMount() {
        component.__mountState = componentState.MOUNTED;
        component.componentDidMount();
    });
};

NodePrototype.__renderRecurse = function(transaction) {
    var _this = this,
        parentId = this.id,
        renderedView;

    this.__checkPropTypes(this.component.props);

    renderedView = this.render();
    renderedView.children = map(renderedView.children, function(child, index) {
        var node;

        if (isPrimativeView(child)) {
            return child;
        } else {
            node = Node.create(child);
            node.id = parentId + "." + getViewKey(child, index);
            _this.appendNode(node);

            return node.__renderRecurse(transaction);
        }
    });

    this.renderedView = renderedView;
    this.__mount(transaction);

    this.__getRefs();

    return renderedView;
};

NodePrototype.unmount = function(transaction) {
    var parentId = this.parent ? this.parent.id : this.id;

    if (this.parent !== null) {
        this.parent.removeNode(this, transaction);
    } else {
        this.removeChildren(transaction);
        this.root.removeNode(this);
    }

    transaction.remove(parentId, this.id, 0);
};

NodePrototype.__unmount = function(transaction) {
    var component = this.component;

    this.root.eventManager.allOff(this.id, transaction);

    component.__mountState = componentState.UNMOUNTING;
    component.componentWillUnmount();

    transaction.queue.enqueue(function onUnmount() {
        component.__mountState = componentState.UNMOUNTED;
    });
};

NodePrototype.update = function(nextView, transaction) {
    var component = this.component;

    this.__update(
        component.props, nextView.props,
        component.children, nextView.children,
        component.__previousState, component.state,
        nextView,
        transaction
    );
};

diff = require("./diff");

NodePrototype.__update = function(
    previousProps, nextProps,
    previousChildren, nextChildren,
    previousState, nextState,
    currentView,
    transaction
) {
    var component = this.component,
        renderedView;

    component.componentWillReceiveProps(nextProps, nextChildren);

    if (component.shouldComponentUpdate(nextProps, nextChildren, nextState)) {

        this.__checkPropTypes(nextProps);

        component.props = nextProps;
        component.children = nextChildren;

        component.componentWillUpdate();

        renderedView = this.render();
        diff(this, this.renderedView, renderedView, transaction);
        this.renderedView = renderedView;

        this.__getRefs();
    } else {
        component.props = nextProps;
        component.children = nextChildren;
    }

    this.currentView = currentView;

    transaction.queue.enqueue(function onUpdate() {
        component.componentDidUpdate(previousProps, previousChildren, previousState);
    });
};

NodePrototype.render = function() {
    var currentView = this.currentView,
        renderedView;

    owner.current = this;
    renderedView = this.component.render();
    renderedView.key = currentView.key;
    renderedView.ref = currentView.ref;
    owner.current = null;

    return renderedView;
};

NodePrototype.__getRefs = function() {
    var component = this.component;

    component.refs = emptyObject;
    getRefs(this, component, this.children);
};

NodePrototype.__checkPropTypes = function(props) {
    var localHas = has,
        displayName = this.component.displayName,
        ComponentClass = this.ComponentClass,
        componentPropTypes = ComponentClass.propTypes,
        propName, error;

    if (componentPropTypes) {
        for (propName in componentPropTypes) {
            if (localHas(componentPropTypes, propName)) {
                error = componentPropTypes[propName](props, propName, displayName);
                if (error !== null) {
                    console.warn(error);
                }
            }
        }
    }
};

function getRefs(owner, ownerComponent, children) {
    var i = -1,
        il = children.length - 1,
        child, currentView;

    while (i++ < il) {
        child = children[i];
        currentView = child.currentView;

        if (currentView.__owner === owner) {
            getRef(owner, ownerComponent, currentView, child.component);
        }

        getRefs(owner, ownerComponent, child.children);
    }
}

function getRef(owner, ownerComponent, currentView, nodeComponent) {
    var ref = currentView.ref,
        refs;

    if (isString(ref)) {
        refs = ownerComponent.refs === emptyObject ? (ownerComponent.refs = {}) : ownerComponent.refs;
        refs[ref] = nodeComponent;
    }
}

function mountEvents(id, props, eventManager, transaction) {
    var propNameToTopLevel = eventManager.propNameToTopLevel,
        localHas = has,
        key;

    for (key in props) {
        if (localHas(propNameToTopLevel, key)) {
            eventManager.on(id, propNameToTopLevel[key], props[key], transaction);
        }
    }
}
