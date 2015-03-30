var nativeComponents = require("./native_components");


module.exports = registerNativeComponent;


function registerNativeComponent(type, constructor) {
    nativeComponents[type] = constructor;
}
