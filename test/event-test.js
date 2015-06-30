var test = require("tape"),
    View = require("../src/View"),
    createComponent = require("./utils/createComponent"),
    createRoot = require("./utils/createRoot");


test("event", function(t) {
    var hits = 0;

    var root = createRoot(function(transaction) {
        var patch;

        hits++;

        if (hits === 2) {
            patch = transaction.patches[root.id][0];

            var incomingEvent = root.eventManager.events.topEvent[root.id];

            t.equal(patch.type, "TEXT", "text patch after update");
            t.equal(patch.next, "foo", "accepts foo on componentDidMount");

            // todo: fixme component state is UPDATING if we
            // don't use setTimeout
            setTimeout(function() {
                incomingEvent({
                    data: "bar"
                });
            }, 100);


        }

        if (hits === 3) {
            patch = transaction.patches[root.id][0];

            t.equal(patch.type, "TEXT", "text text after event causes state update");
            t.equal(patch.next, "bar", "accepts bar from setState");

            t.end();
        }

    });

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
