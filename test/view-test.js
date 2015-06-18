var test = require("tape"),
    Component = require("../src/component"),
    isFunction = require("is_function"),
    View = require("../src/view");

test("View.create", function(t) {

    var divView = View.create("div", {
        className: 'foo',
        key: 'div-key',
        ref: 'divElem'
    });

    t.equal(divView.type, "div", "constructs correct type");
    t.equal(divView.key, "div-key", "constructs correct key");
    t.equal(divView.ref, "divElem", "constructs correct ref");
    t.equal(divView.props.className, "foo", "adds non-special config options to props");

    function tmpComponent(props, children, context) {
        Component.call(this, props, children, context);
    }
    Component.extend(tmpComponent, "tmpComponent");
    tmpComponent.defaultProps = {
        foo: "bar"
    };

    var cv = View.create(tmpComponent, {
        className: "c"
    });
    t.equal(isFunction(cv.type), true, "creates view of type function from component");
    t.equal(View.isViewComponent(cv), true, "creates a view component");
    t.equal(cv.props.foo, "bar", "sets defaultProps");
    t.equal(cv.props.className, "c", "merges in defaultProps with passed props");

    t.end();

});

test("View.create with children", function(t) {
    var tmp = View.create("div", {
            key: "d"
        },
        View.create("span", {
            className: "s"
        }),
        "hello world",
        45
    );

    t.equal(tmp.children.length, 3, "inserts child views");
    t.equal(View.isPrimitiveView(tmp.children[0]), false, "view is not primitive");
    t.equal(View.isPrimitiveView(tmp.children[1]), true, "string is primitive view");
    t.equal(View.isPrimitiveView(tmp.children[2]), true, "number is primitive view");

    var tmp2 = View.create("div", [
        View.create("span", {
            ref: "s"
        }),
        View.create("p", {
            ref: "p"
        }),
        "hello world"
    ]);

    t.equal(tmp2.children.length, 3, "inserts child views as an array");
    t.equal(tmp2.children[0].ref, "s", "inserts first child");
    t.equal(tmp2.children[1].ref, "p", "inserts second child");
    t.equal(View.isPrimitiveView(tmp2.children[2]), true, "inserts third child");

    var tmp3 = View.create("span", "hello world");
    t.equal(tmp3.children.length, 1, "inserts child primitive view with no config opts");
    t.equal(tmp3.type, "span", "creates view");

    t.end();
});

test("View.createFactory", function(t) {

    var spanView = View.createFactory("span");

    var sv = spanView({
        className: "s",
        ref: "s",
        key: "s"
    }, [
        "hello world"
    ]);

    t.equal(sv.type, "span", "factory creates view");
    t.equal(sv.key, "s", "factory adds key to view");
    t.equal(sv.ref, "s", "factory adds ref to view");
    t.equal(sv.props.className, "s", "factory adds props to view");
    t.equal(sv.children.length, 1, "factory inserts children to view");
    t.end();
});

test("View.copy", function(t) {

    var spanView = View.create("span", {
            key: "s",
            ref: "s",
            className: "s"
        }),
        divView = View.create("div", {
            className: "d"
        });

    var copyResult = spanView.copy(divView);

    t.equal(copyResult.type, "div", "overrides type when copying from other view");
    t.equal(copyResult.key, null, "overrides key when copying from other view");
    t.equal(copyResult.ref, null, "overrides ref when copying from other view");
    t.equal(copyResult.props.className, "d", "overrides props when copying from other view");
    t.equal(copyResult, spanView, "keeps same object instance");

    t.end();
});

test("View.clone", function(t) {

    var tmp = View.create("span", {
            key: "s",
            ref: "s",
            foo: "bar"
        }),
        t2 = tmp.clone();

    t.equal(t2.key, "s", "clones key");
    t.equal(t2.ref, "s", "clones ref");
    t.equal(t2.props.foo, "bar", "clones props");
    t.notEqual(t2, tmp, "creates new object instance");

    t.end();
});

test("View.toJSON", function(t) {

    var tmp = View.create("div", {
        className: "d"
    }, [
        View.create("span"),
        "primitive view"
    ]);

    var tmpJson = tmp.toJSON();
    t.equal(View.isViewJSON(tmpJson), true, "converts view to JSON");

    t.end();
});
