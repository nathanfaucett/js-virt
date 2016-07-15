var Component = require("../../src/Component");


module.exports = createComponent;


function createComponent(state) {

    var tc = function __test_component__(props, children, context) {
        Component.call(this, props, children, context);

        this.state = state || {};
    };

    Component.extend(tc, "__test_component__");

    return tc;
}
