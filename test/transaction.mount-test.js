var test = require("tape"),
    View = require("../src/View"),
    createRoot = require("./utils/createRoot");


function emptyFunction() {}


test("transaction mount", function(assert) {
    var root = createRoot(function beforeCleanUp(transaction) {
        var patch = transaction.patches[root.id][0];

        assert.equal(patch.type, "MOUNT", "type should be MOUNT");
        assert.equal(patch.id, root.id, "first root id should be " + root.id);
        assert.deepEqual(patch.next, {
            __owner: null,
            __context: null,
            type: "div",
            key: "div.key",
            ref: null,
            props: {
                onEvent: emptyFunction
            },
            children: [{
                __owner: null,
                __context: null,
                type: "p",
                key: null,
                ref: null,
                props: {},
                children: ["Hello World!"]
            }]
        }, "mount data should be full view structure");

        assert.end();
    });

    root.render(
        View.create("div", {
                onEvent: emptyFunction,
                key: "div.key"
            },
            View.create("p", "Hello World!")
        )
    );
});