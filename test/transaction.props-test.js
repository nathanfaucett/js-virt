var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("transaction triggers props patch", function(assert) {
    var hits = 0;

    var root = createRoot(function beforeCleanUp(transaction) {
        var patches = transaction.patches,
            patch;

        hits++;

        if (hits === 2) {
            patch = patches[root.id][0];

            assert.equal(patch.id, root.id, "patch id should be on root");
            assert.equal(patch.type, "PROPS", "state change for props triggers PROPS patch");
            assert.deepEqual(patch.next, {
                age: 2
            }, "takes in next props patch");

            assert.end();
        }
    });


    var component = createComponent();

    component.prototype.render = function() {
        return View.create("p", {
            key: "p.key",
            ref: "p.ref",
            age: this.props.age
        }, "p-tag");
    };

    root.render(View.create(component, {
        age: 1
    }));
    root.render(View.create(component, {
        age: 2
    }));
});