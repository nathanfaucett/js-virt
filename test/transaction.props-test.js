var test = require("tape"),
    View = require("../src/view"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


function emptyFunction() {}


test("transaction triggers props patch", function(t) {

    var hits = 0;
    var root = createRoot(function(transaction) {
        
        hits++;

        var patches = transaction.patches;

        if (hits === 2) {
            var patch = patches[root.id][0];

            t.equal(patch.id, root.id, "patch id should be on root");
            t.equal(patch.type, "PROPS", "state change for props triggers PROPS patch");
            t.deepEqual(patch.next, {
                age: 2
            }, "takes in next props patch");

            t.end();
        }
        
    });


    var component = createComponent();

    component.prototype.render = function() {

        return View.create("p", { key: "p.key", ref: "p.ref", age: this.props.age }, "p-tag");

    }

    root.render(View.create(component, { age: 1 }));
    root.render(View.create(component, { age: 2 }))
    
});
