var has = require("has"),
    map = require("map"),
    indexOf = require("index_of"),
    isString = require("is_string"),
    isFunction = require("is_function"),
    extend = require("extend"),
    owner = require("./owner"),
    context = require("./context"),
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

    this.component = null;

    this.renderedView = null;
    this.currentView = null;
}

NodePrototype = Node.prototype;

Node.create = function(view) {
    var node = new Node(),
        Class, component, props, context;

    if (isFunction(view.type)) {
        Class = view.type;
    } else {
        Class = getComponentClassForType(view.type);
    }

    node.currentView = view;
    props = node.__processProps(view.props);
    context = node.__processContext(view.__context);

    component = new Class(props, view.children, context);
    component.__node = node;
    node.component = component;

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

    this.__removeNode(node, transaction);
    children.splice(indexOf(children, node), 1);
};

NodePrototype.__removeNode = function(node, transaction) {
    node.__removeChildren(transaction);
    node.__unmount(transaction);
    node.parent = null;
    this.root.removeNode(node);
};

NodePrototype.__removeChildren = function(transaction) {
    var children = this.children,
        i = -1,
        il = children.length - 1;

    while (i++ < il) {
        this.__removeNode(children[i], transaction);
    }

    children.length = 0;
};

NodePrototype.__detach = function(transaction) {
    if (this.parent !== null) {
        this.parent.removeNode(this, transaction);
    } else {
        this.__removeChildren(this, transaction);
        this.root.removeNode(this);
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
    this.__detach(transaction);
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
        previousContext = component.context,
        nextContext, renderedView;

    nextProps = this.__processProps(nextProps);
    nextContext = this.__processContext(currentView.__context);

    component.componentWillReceiveProps(nextProps, nextChildren, nextContext);

    if (component.shouldComponentUpdate(nextProps, nextChildren, nextState, nextContext)) {

        component.props = nextProps;
        component.children = nextChildren;
        component.context = nextContext;

        component.componentWillUpdate();

        renderedView = this.render();
        diff(this, this.renderedView, renderedView, transaction);
        this.renderedView = renderedView;

        this.__getRefs();
    } else {
        component.props = nextProps;
        component.children = nextChildren;
        component.context = nextContext;
    }

    this.currentView = currentView;

    transaction.queue.enqueue(function onUpdate() {
        component.componentDidUpdate(previousProps, previousChildren, previousState, previousContext);
    });
};

NodePrototype.render = function() {
    var currentView = this.currentView,
        previousContext = context.current,
        renderedView;

    context.current = this.__processChildContext(currentView.__context);
    owner.current = this;

    renderedView = this.component.render();
    renderedView.key = currentView.key;
    renderedView.ref = currentView.ref;

    context.current = previousContext;
    owner.current = null;

    return renderedView;
};

NodePrototype.__getRefs = function() {
    var component = this.component;

    component.refs = emptyObject;
    getRefs(this, component, this.children);
};

NodePrototype.__checkTypes = function(propTypes, props) {
    var localHas = has,
        displayName = this.component.displayName,
        propName, error;

    if (propTypes) {
        for (propName in propTypes) {
            if (localHas(propTypes, propName)) {
                error = propTypes[propName](props, propName, displayName);
                if (error !== null) {
                    console.warn(error);
                }
            }
        }
    }
};

NodePrototype.__processProps = function(props) {
    var propTypes;

    if (process.env.NODE_ENV === "development") {
        propTypes = this.currentView.type.propTypes;

        if (propTypes) {
            this.__checkTypes(propTypes, props);
        }
    }

    return props;
};

NodePrototype.__maskContext = function(context) {
    var maskedContext = null,
        contextTypes, contextName, localHas;

    if (isString(this.currentView.type)) {
        return emptyObject;
    } else {
        contextTypes = this.currentView.type.contextTypes;

        if (contextTypes) {
            maskedContext = {};
            localHas = has;

            for (contextName in contextTypes) {
                if (localHas(contextTypes, contextName)) {
                    maskedContext[contextName] = context[contextName];
                }
            }
        }

        return maskedContext;
    }
};

NodePrototype.__processContext = function(context) {
    var maskedContext = this.__maskContext(context),
        contextTypes;

    if (process.env.NODE_ENV === "development") {
        contextTypes = this.currentView.type.contextTypes;

        if (contextTypes) {
            this.__checkTypes(contextTypes, maskedContext);
        }
    }

    return maskedContext;
};

NodePrototype.__processChildContext = function(currentContext) {
    var component = this.component,
        childContext = component.getChildContext(),
        childContextTypes, localHas, contextName, displayName;

    if (childContext) {
        childContextTypes = this.currentView.type.childContextTypes;

        if (process.env.NODE_ENV === "development") {
            this.__checkTypes(childContextTypes, childContext);
        }

        localHas = has;
        displayName = component.displayName;

        for (contextName in childContext) {
            if (!localHas(childContextTypes, contextName)) {
                console.warn(new Error(
                    displayName + " getChildContext(): key " + contextName + " is not defined in childContextTypes"
                ));
            }
        }

        return extend({}, currentContext, childContext);
    } else {
        return currentContext;
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
