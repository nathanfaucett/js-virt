var nativeComponents = require("./native_components"),
    createNativeComponentForType = require("./create_native_component_for_type");


module.exports = getComponentClassForType;


function getComponentClassForType(type) {
    var Class = nativeComponents[type];

    if (Class) {
        return Class;
    } else {
        Class = createNativeComponentForType(type);
        nativeComponents[type] = Class;
        return Class;
    }
}
