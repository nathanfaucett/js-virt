var isFunction = require("is_function"),
    getComponentClassForType = require("../utils/get_component_class_for_type"),
    Node;


module.exports = createNode;


Node = require("./node");


function createNode(view) {
    var node = new Node(),
        Class, instance;

    if (isFunction(view.type)) {
        Class = view.type;
    } else {
        Class = getComponentClassForType(view.type);
    }

    instance = new Class(view.props, view.children);
    instance.__node = node;
    node.instance = instance;

    return node;
}
