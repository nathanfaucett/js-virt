var test = require("tape"),
    View = require("../src/view"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("transaction triggers text patch", function(t) {

    var hits = 0;
    var root = createRoot(function(transaction) {

        hits++;

        var patches = transaction.patches;

        if (hits === 2) {
            var patch = patches[root.id + ".0"][0];

            t.equal(patch.id, root.id + ".0", "patch id should be first child of root");
            t.equal(patch.type, "TEXT", "state change for text triggers TEXT patch");
            t.equal(patch.next, "bar", "takes in next text patch");

            t.end();
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
