var nativeComponents = require("./nativeComponents");


module.exports = registerNativeComponent;


function registerNativeComponent(type, constructor) {
    nativeComponents[type] = constructor;
    return constructor;
}
