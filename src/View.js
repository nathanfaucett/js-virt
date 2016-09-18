var isPrimitive = require("@nathanfaucett/is_primitive"),
    isFunction = require("@nathanfaucett/is_function"),
    isArray = require("@nathanfaucett/is_array"),
    isString = require("@nathanfaucett/is_string"),
    isObject = require("@nathanfaucett/is_object"),
    isNullOrUndefined = require("@nathanfaucett/is_null_or_undefined"),
    isNumber = require("@nathanfaucett/is_number"),
    has = require("@nathanfaucett/has"),
    arrayMap = require("@nathanfaucett/array-map"),
    extend = require("@nathanfaucett/extend"),
    propsToJSON = require("./utils/propsToJSON"),
    owner = require("./owner"),
    context = require("./context");


var ViewPrototype;


module.exports = View;


function View(type, key, ref, props, children, owner, context) {
    this.__owner = owner;
    this.__context = context;
    this.type = type;
    this.key = key;
    this.ref = ref;
    this.props = props;
    this.children = children;
}
ViewPrototype = View.prototype;

ViewPrototype.__View__ = true;

ViewPrototype.copy = function(view) {
    this.__owner = view.__owner;
    this.__context = view.__context;
    this.type = view.type;
    this.key = view.key;
    this.ref = view.ref;
    this.props = view.props;
    this.children = view.children;
    return this;
};

ViewPrototype.clone = function() {
    return new View(this.type, this.key, this.ref, this.props, this.children, this.__owner, this.__context);
};

ViewPrototype.toJSON = function() {
    return toJSON(this);
};

View.isView = isView;
View.isPrimitiveView = isPrimitiveView;
View.isViewComponent = isViewComponent;
View.isViewJSON = isViewJSON;
View.toJSON = toJSON;

View.clone = function(view, config, children) {
    var props = extend({}, view.props),
        key = view.key,
        ref = view.ref,
        viewOwner = view.__owner,
        childrenLength = arguments.length - 2,
        childArray, i, il;

    if (config) {
        if (isString(config.ref)) {
            ref = config.ref;
            viewOwner = owner.current;
        }
        if (isString(config.key)) {
            key = config.key;
        }
        extractConfig(props, config);
    }

    if (childrenLength === 1 && !isArray(children)) {
        children = [children];
    } else if (childrenLength > 1) {
        childArray = new Array(childrenLength);
        i = -1;
        il = childrenLength - 1;
        while (i++ < il) {
            childArray[i] = arguments[i + 2];
        }
        children = childArray;
    } else {
        children = view.children;
    }

    if (process.env.NODE_ENV !== "production") {
        ensureValidChildren(children);
    }

    return new View(view.type, key, ref, props, children, viewOwner, context.current);
};

View.create = function(type, config, children) {
    var isConfigArray = isArray(config);

    if (isConfigArray || isChild(config)) {
        if (isConfigArray) {
            children = config;
        } else if (arguments.length > 1) {
            children = extractChildren(arguments, 1);
        }
        config = null;
    } else if (!isNullOrUndefined(children)) {
        if (isArray(children)) {
            children = children;
        } else if (arguments.length > 2) {
            children = extractChildren(arguments, 2);
        }
    } else {
        children = [];
    }

    return construct(type, config, children);
};

View.createFactory = function(type) {
    return function factory(config, children) {
        var isConfigArray = isArray(config);

        if (isConfigArray || isChild(config)) {
            if (isConfigArray) {
                children = config;
            } else if (config && arguments.length > 0) {
                children = extractChildren(arguments, 0);
            }
            config = null;
        } else if (!isNullOrUndefined(children)) {
            if (isArray(children)) {
                children = children;
            } else if (arguments.length > 1) {
                children = extractChildren(arguments, 1);
            }
        }

        return construct(type, config, children);
    };
};

function construct(type, config, children) {
    var props = {},
        key = null,
        ref = null;

    if (config) {
        if (isString(config.key)) {
            key = config.key;
        }
        if (isString(config.ref)) {
            ref = config.ref;
        }
        extractConfig(props, config);
    }
    if (type && type.defaultProps) {
        extractDefaults(props, type.defaultProps);
    }
    if (process.env.NODE_ENV !== "production") {
        ensureValidChildren(children);
    }

    return new View(type, key, ref, props, children, owner.current, context.current);
}

function extractConfig(props, config) {
    var localHas = has,
        propName;

    for (propName in config) {
        if (localHas(config, propName)) {
            if (!(propName === "key" || propName === "ref")) {
                props[propName] = config[propName];
            }
        }
    }
}

function extractDefaults(props, defaultProps) {
    var localHas = has,
        propName;

    for (propName in defaultProps) {
        if (localHas(defaultProps, propName)) {
            if (isNullOrUndefined(props[propName])) {
                props[propName] = defaultProps[propName];
            }
        }
    }
}

function toJSON(view) {
    if (isPrimitive(view)) {
        return view;
    } else {
        return {
            type: view.type,
            key: view.key,
            ref: view.ref,
            props: propsToJSON(view.props),
            children: arrayMap(view.children, toJSON)
        };
    }
}

function isView(obj) {
    return isObject(obj) && obj.__View__ === true;
}

function isViewComponent(obj) {
    return isView(obj) && isFunction(obj.type);
}

function isViewJSON(obj) {
    return (
        isObject(obj) &&
        isString(obj.type) &&
        isObject(obj.props) &&
        isArray(obj.children)
    );
}

function isPrimitiveView(object) {
    return isString(object) || isNumber(object);
}

function isChild(object) {
    return isView(object) || isPrimitiveView(object);
}

function extractChildren(args, offset) {
    var children = [],
        i = offset - 1,
        il = args.length - 1,
        j = 0,
        arg;

    while (i++ < il) {
        arg = args[i];

        if (!isNullOrUndefined(arg) && arg !== "" && !isArray(arg)) {
            children[j++] = arg;
        }
    }

    return children;
}

function ensureValidChildren(children) {
    var i = -1;
    il = children.length - 1;

    while (i++ < il) {
        if (!isChild(children[i])) {
            throw new TypeError("child of a View must be a String, Number or a View");
        }
    }
}