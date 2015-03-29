var inherits = require("inherits"),
    extend = require("extend");


var ComponentPrototype;


module.exports = Component;


function Component(props, children) {
    this.__node = null;
    this.__previousState = null;
    this.props = props;
    this.children = children;
    this.state = null;
    this.refs = null;
}

ComponentPrototype = Component.prototype;

Component.extend = function(child, displayName) {
    inherits(child, this);
    child.displayName = child.prototype.displayName = displayName || ComponentPrototype.displayName;
    return child;
};

ComponentPrototype.displayName = "Component";
ComponentPrototype.propTypes = {};
ComponentPrototype.contextTypes = {};

ComponentPrototype.render = function() {
    throw new Error("render() render must be defined on Components");
};

ComponentPrototype.setState = function(state) {
    var node = this.__node;

    this.__previousState = this.state;
    this.state = extend({}, this.state, state);

    node.root.update(node);
};

ComponentPrototype.forceUpdate = function() {
    var node = this.__node;
    node.root.update(node);
};

ComponentPrototype.componentDidMount = function() {};

ComponentPrototype.componentDidUpdate = function( /* previousProps, previousChildren, previousState */ ) {};

ComponentPrototype.componentWillMount = function() {};

ComponentPrototype.componentWillUnmount = function() {};

ComponentPrototype.componentWillReceiveProps = function( /* nextProps, nextChildren */ ) {};

ComponentPrototype.componentWillUpdate = function( /* nextProps, nextChildren, nextState */ ) {};

ComponentPrototype.shouldComponentUpdate = function( /* nextProps, nextChildren, nextState */ ) {
    return true;
};
