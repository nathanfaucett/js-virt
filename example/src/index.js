var virt = require("../../src/index");


function Top(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Top, "Top");

Top.prototype.componentDidMount = function() {
    console.log("last");
};

Top.prototype.render = function() {
    return virt.createView(Bottom);
};


function Text(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Text, "Text");

Text.prototype.componentDidMount = function() {
    console.log("first");
};

Text.prototype.render = function() {
    return virt.createView("div", {
            className: "text"
        },
        virt.createView("p", "Text")
    );
};


function Bottom(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(Bottom, "Bottom");

Bottom.prototype.componentDidMount = function() {
    console.log("middle");
};

Bottom.prototype.render = function() {
    return virt.createView("div", {
            className: "bottom"
        },
        virt.createView(Text)
    );
};


var root = global.root = new virt.Root();

root.adaptor = {
    handle: function(transaction, callback) {
        console.log(transaction);
        callback();
    }
};

root.render(virt.createView(Top));
