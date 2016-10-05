var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("transaction enqueues transaction when current is done", function(assert) {
    var hits = 0;

    var root = createRoot(function beforeCleanUp(transaction) {
        var patches = transaction.patches,
            patch;

        hits++;

        if (hits === 3) {
            patch = patches[root.id][0];

            assert.equal(patch.id, root.id, "patch id should be on root");
            assert.equal(patch.type, "TEXT", "state change triggers TEXT patch");
            assert.equal(patch.next, "text 2");
        }

        if (hits === 4) {
            patch = patches[root.id][0];

            assert.equal(patch.id, root.id, "patch id should be on root");
            assert.equal(patch.type, "TEXT", "state change triggers TEXT patch");
            assert.equal(patch.next, "text 3");

            assert.end();
        }
    }, null, 10);


    var Component = createComponent({
        text: "text 0"
    });

    Component.prototype.componentDidMount = function() {
        this.replaceState({
            text: "text 1"
        });
    };

    Component.prototype.componentWillUpdate = function(nextProps, nextChildren, nextState) {
        var _this = this;

        if (nextState.text === "text 1") {
            setTimeout(function onSetTimeout() {
                _this.replaceState({
                    text: "text 2"
                });
            });
        } else if (nextState.text === "text 2") {
            _this.replaceState({
                text: "text 3"
            });
        }
    };

    Component.prototype.render = function() {
        return View.create("p", this.state.text);
    };

    root.render(View.create(Component, {
        age: 1
    }));
});