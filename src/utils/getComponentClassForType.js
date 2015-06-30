var nativeComponents = require("./nativeComponents"),
    registerNativeComponent = require("./registerNativeComponent"),
    createNativeComponentForType = require("./createNativeComponentForType");


module.exports = getComponentClassForType;


function getComponentClassForType(type) {
    var Class = nativeComponents[type];

    if (Class) {
        return Class;
    } else {
        return registerNativeComponent(type, createNativeComponentForType(type));
    }
}
