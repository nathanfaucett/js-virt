var createNode = require("./tree/create_node"),
    shouldUpdate = require("./utils/should_update");


module.exports = render;


function render(nextView, rootNode, id) {
    var previousNode = rootNode.children[id];

    if (previousNode !== undefined) {
        if (shouldUpdate(previousNode.renderedView, nextView)) {
            previousNode.update(nextView);
            return;
        } else {
            previousNode.unmount();
        }
    }

    previousNode = createNode(nextView);
    previousNode.id = id;
    rootNode.add(previousNode);

    previousNode.mount();
}
