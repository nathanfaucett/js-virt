var Root = require("../../src/Root");


module.exports = createRoot;


// callbacks called on each render
function createRoot(beforeCleanUp, afterCleanUp) {
    var root = new Root();

    root.adapter = {
        handle: function(transaction, callback) {
            if (beforeCleanUp) {
                beforeCleanUp(transaction);
            }
            callback();
            if (afterCleanUp) {
                afterCleanUp(transaction);
            }
        }
    };
    root.eventManager.propNameToTopLevel = {
        onEvent: "topEvent"
    };

    return root;
}
