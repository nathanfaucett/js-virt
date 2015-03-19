var View = require("../view"),
    Component = require("../component");


var nativeComponents = {};


module.exports = getComponentClassForType;


function getComponentClassForType(type) {
    var Class = nativeComponents[type];

    if (Class) {
        return Class;
    } else {
        return (nativeComponents[type] = createNativeComponentForType(type));
    }
}

function createNativeComponentForType(type) {
    function NativeComponent(props, children) {
        Component.call(this, props, children);
    }
    Component.extend(NativeComponent);

    NativeComponent.prototype.render = function() {
        return new View(type, null, null, this.props, this.children);
    };

    return NativeComponent;
}
