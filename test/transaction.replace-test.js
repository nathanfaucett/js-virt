var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("transaction triggers insert patch", function(t) {

    var hits = 0;
    var root = createRoot(function(transaction) {

        hits++;

        var patches = transaction.patches;

        if (hits === 2) {
            var patch = patches[root.id][0];

            t.equal(patch.id, root.id, "patch id should be on root");
            t.equal(patch.type, "REPLACE", "state change for text triggers REPLACE patch");
            t.deepEqual(patch.next, {
                __owner: null,
                __context: null,
                type: "p",
                key: "parent.key",
                ref: null,
                props: {},
                children: ["p-tag"]
            }, "takes in next replace patch");

            t.end();
        }

    });

    var component = createComponent({
        replaceNode: false
    });

    component.prototype.render = function() {

        var s = this.state;

        if (s.replaceNode) {

            return View.create("p", null, "p-tag");

        } else {

            return View.create("a", null, "a-tag");

        }

    };

    component.prototype.componentDidMount = function() {
        this.setState({
            replaceNode: true
        });
    };

    root.render(View.create(component, {
        key: "parent.key"
    })); // calls mount


});
