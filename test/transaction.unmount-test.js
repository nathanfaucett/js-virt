var test = require("tape"),
    View = require("../src/View"),
    createRoot = require("./utils/createRoot");


test("transaction unmount", function(assert) {
    var hits = 0;

    var root = createRoot(function beforeCleanUp(transaction) {
        var remove;

        hits++;

        if (hits === 2) {
            remove = transaction.removes[root.id][0];

            assert.equal(remove.id, root.id, "id should be parent of removed view");
            assert.equal(remove.childId, root.id + ".0", "childId should be id of removed view");
            assert.equal(remove.index, 0, "index should be index where to find child in children array");

            assert.end();
        }
    });

    root.render(
        View.create("div",
            View.create("p", "Hello World!")
        )
    );
    root.render(View.create("div"));
});