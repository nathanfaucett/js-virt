var test = require("tape"),
    View = require("../src/View"),
    createRoot = require("./utils/createRoot");


test("transaction order", function(assert) {
    var hits = 0;

    var root = createRoot(function beforeCleanUp(transaction) {
        var patch, order;

        hits++;

        if (hits === 2) {
            patch = transaction.patches[root.id][0];
            order = patch.order;

            assert.equal(patch.type, "ORDER", "type should be ORDER");
            assert.equal(patch.id, root.id, "id should be parent of reordered children");
            assert.equal(order["0"], 2, "key 0 should move to 2nd index");
            assert.equal(order["1"], 0, "key 1 should move to the 0 index");
            assert.equal(order["2"], 1, "key 2 should move to 1st index");

            assert.end();
        }
    });

    root.render(
        View.create("ul",
            View.create("li", {
                key: "0"
            }),
            View.create("li", {
                key: "1"
            }),
            View.create("li", {
                key: "2"
            })
        )
    );
    root.render(
        View.create("ul",
            View.create("li", {
                key: "2"
            }),
            View.create("li", {
                key: "0"
            }),
            View.create("li", {
                key: "1"
            })
        )
    );
});