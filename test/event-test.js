var test = require("tape"),
    View = require("../src/view"),
    createRoot = require("./utils/createRoot");


function emptyFunction() {}


test("event", function(assert) {
    var root = createRoot(function() {
        assert.equal(root.eventManager.events.topEvent[root.id], emptyFunction, "event should be added to eventManager");
        assert.end();
    });

    root.render(
        View.create("div", {
            onEvent: emptyFunction
        })
    );
});
