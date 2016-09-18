var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("event", function(assert) {
    var hits = 0;

    var root = createRoot(
        function beforeCleanUp(transaction) {
            var patch;

            hits++;

            if (hits === 2) {
                patch = transaction.patches[root.id][0];

                assert.equal(patch.type, "TEXT", "text patch after update");
                assert.equal(patch.next, "foo", "accepts foo on componentDidMount");
            }

            if (hits === 3) {
                patch = transaction.patches[root.id][0];

                assert.equal(patch.type, "TEXT", "text text after event causes state update");
                assert.equal(patch.next, "bar", "accepts bar from setState");

                assert.end();
            }

        },
        function afterCleanUp() {
            var event;

            if (hits === 2) {
                event = root.eventManager.events.topEvent[root.id];

                event({
                    data: "bar"
                });
            }
        }
    );

    var Component = createComponent({
        text: "default"
    }, function constructor() {
        var _this = this;
        this.onEvent = function(e) {
            return _this._onEvent(e);
        };
    });

    Component.prototype._onEvent = function(e) {
        this.setState({
            text: e.data
        });
    };

    Component.prototype.render = function() {
        return (
            View.create("p", {
                onEvent: this.onEvent
            }, this.state.text)
        );

    };

    Component.prototype.componentDidMount = function() {
        this.setState({
            text: "foo"
        });
    };

    root.render(View.create(Component));
});