var Messenger = require("@nathanfaucett/messenger"),
    createMessengerAdapter = require("@nathanfaucett/messenger_adapter"),
    Root = require("../../src/Root");


module.exports = createRoot;


// callbacks called on each render
function createRoot(beforeCleanUp, afterCleanUp, delay) {
    var root = new Root(),

        socket = createMessengerAdapter(),

        messengerClient = new Messenger(socket.client),
        messengerServer = new Messenger(socket.server);


    root.adapter = {
        messenger: messengerServer,
        messengerClient: messengerClient
    };
    root.eventManager.propNameToTopLevel = {
        onEvent: "topEvent"
    };

    messengerClient.on("virt.handleTransaction", function onHandleTransaction(transaction, callback) {
        if (beforeCleanUp) {
            beforeCleanUp(transaction);
        }

        function onTransaction() {
            callback();
            if (afterCleanUp) {
                afterCleanUp(transaction);
            }
        }

        if (delay) {
            setTimeout(onTransaction, delay);
        } else {
            onTransaction();
        }
    });
    messengerClient.on("virt.onGlobalEvent", function onHandle(topLevelType, callback) {
        if (delay) {
            setTimeout(callback, delay);
        } else {
            callback();
        }
    });
    messengerClient.on("virt.offGlobalEvent", function onHandle(topLevelType, callback) {
        if (delay) {
            setTimeout(callback, delay);
        } else {
            callback();
        }
    });
    messengerClient.on("virt.getDeviceDimensions", function getDeviceDimensions(data, callback) {
        function onGetDeviceDimensions() {
            callback(undefined, {});
        }

        if (delay) {
            setTimeout(onGetDeviceDimensions, delay);
        } else {
            onGetDeviceDimensions();
        }
    });

    return root;
}