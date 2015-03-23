var View = require("../view"),
    getViewKey = require("../utils/get_view_key");


var isPrimativeView = View.isPrimativeView;


module.exports = eachChildren;


function eachChildren(parentId, children, fn) {
    var i = -1,
        il = children.length - 1,
        child, id;

    while (i++ < il) {
        child = children[i];

        if (!isPrimativeView(child)) {
            id = parentId + "." + getViewKey(child, i);

            if (fn(child, id, i) === false) {
                return false;
            } else {
                eachChildren(id, child.children, fn);
            }
        }
    }

    return true;
}
