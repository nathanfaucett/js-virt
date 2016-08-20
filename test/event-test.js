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
    });

    Component.prototype.render = function() {
        var _this = this;

        return (
            View.create("p", {
                onEvent: function(event) {
                    _this.setState({
                        text: event.data
                    });
                }
            }, _this.state.text)
        );

    };

    Component.prototype.componentDidMount = function() {
        this.setState({
            text: "foo"
        });
    };

    root.render(View.create(Component));
});
