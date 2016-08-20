var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("transaction triggers insert patch", function(assert) {
    var hits = 0;

    var root = createRoot(function beforeCleanUp(transaction) {
        var patches = transaction.patches,
            patch;

        hits++;

        if (hits === 2) {
            patch = patches[root.id][0];

            assert.equal(patch.id, root.id, "patch id should be on root");
            assert.equal(patch.type, "INSERT", "state change for child node triggers INSERT patch");
            assert.deepEqual(patch.next, {
                __owner: null,
                __context: null,
                type: "p",
                key: "p.key",
                ref: "p.ref",
                props: {},
                children: ["p-tag"]
            }, "takes in correct next insert patch");

            assert.end();
        }
    });

    var Component = createComponent({
        insertNode: false
    });

    Component.prototype.render = function() {
        var s = this.state;

        if (s.insertNode) {
            return (
                View.create("div", null,
                    View.create("p", {
                        key: "p.key",
                        ref: "p.ref"
                    }, "p-tag")
                )
            );
        } else {
            return (
                View.create("div", null,
                    View.create("a", {
                        key: "a.key",
                        ref: "a.ref"
                    }, "a-tag")
                )
            );
        }
    };

    Component.prototype.componentDidMount = function() {
        this.setState({
            insertNode: true
        });
    };

    root.render(View.create(Component, {
        key: 'component.key'
    })); // calls mount
});
