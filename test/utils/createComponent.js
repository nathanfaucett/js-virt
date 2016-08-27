var Component = require("../../src/Component");


module.exports = createComponent;


function createComponent(state) {

    function TestComponent(props, children, context) {

        Component.call(this, props, children, context);

        this.state = state || {};
    }

    Component.extend(TestComponent, "virt.test.TestComponent");

    return TestComponent;
}