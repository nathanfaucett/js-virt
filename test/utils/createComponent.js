var Component = require("../../src/Component");


module.exports = createComponent;


function createComponent(state, fn) {

    function TestComponent(props, children, context) {

        Component.call(this, props, children, context);

        this.state = state || {};

        if (fn) {
            fn.call(this, props, children, context);
        }
    }

    Component.extend(TestComponent, "virt.test.TestComponent");

    return TestComponent;
}