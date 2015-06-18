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

        console.log(patches);

        if (hits === 2) {
            var patch = patches[root.id][0];

            t.equal(patch.id, root.id, "patch id should be on root");
            t.equal(patch.type, "REPLACE", "state change for text triggers REPLACE patch");
            t.deepEqual(patch.next, {
                __owner: null,
                __context: null,
                type: "p",
                key: null,
                ref: null,
                props: {},
                children: [ "p-tag" ]
            }, "takes in next replace patch");

            t.end();
        }
        
    });

    var state = { replaceNode: false };

    var component = createComponent(state);

    component.prototype.render = function() {
        
        return View.create("p", { key: "p.key", ref: "p.ref" }, "p-tag");

    }

    var props = { age: 1 };

    var vc = View.create(component, props); 
    root.render(vc); // calls mount
    props.age = 2;
    root.render(vc);

    
});
