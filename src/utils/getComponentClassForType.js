var nativeComponents = require("./nativeComponents"),
    createNativeComponentForType = require("./createNativeComponentForType");


module.exports = getComponentClassForType;


function getComponentClassForType(rootNativeComponents, type) {
    var Class = rootNativeComponents[type] || nativeComponents[type];

    if (Class) {
        return Class;
    } else {
        Class = createNativeComponentForType(type);
        rootNativeComponents[type] = nativeComponents[type] = Class;
        return Class;
    }
}
