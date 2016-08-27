var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("transaction triggers text patch", function(assert) {
    var hits = 0;

    var root = createRoot(function beforeCleanUp(transaction) {
        var patches = transaction.patches,
            patch;

        hits++;

        if (hits === 2) {
            patch = patches[root.id + ".0"][0];

            assert.equal(patch.id, root.id + ".0", "patch id should be first child of root");
            assert.equal(patch.type, "TEXT", "state change for text triggers TEXT patch");
            assert.equal(patch.next, "bar", "takes in next text patch");

            assert.end();
        }

    });

    var state = {
        text: "foo"
    };

    var component = createComponent(state);

    component.prototype.render = function() {
        var s = this.state;

        return (
            View.create("div", {
                    key: "div.key"
                },
                View.create("div", {},
                    s.text
                )
            )
        );
    };

    var vc = View.create(component, {
        key: 'component.key'
    });
    root.render(vc); // calls mount
    state.text = "bar";
    root.render(vc);


});