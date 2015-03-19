var Renderer = require("../renderer");


var RootPrototype,
    ROOT_ID = 0;


module.exports = Root;


function Root() {
    this.id =  "." + (ROOT_ID++).toString(36);
    this.renderer = new Renderer();
    this.children = {};
}

RootPrototype = Root.prototype;

RootPrototype.add = function(node) {
    var id = node.id,
        children = this.children;

    if (children[id] === undefined) {
        node.root = this;
        children[id] = node;
    }
};

RootPrototype.remove = function(node) {
    var id = node.id,
        children = this.children;

    if (children[id] !== undefined) {
        node.parent = null;
        delete children[id];
    }
};
