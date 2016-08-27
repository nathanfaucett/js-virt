var indexOf = require("@nathanfaucett/index_of"),
    isUndefined = require("@nathanfaucett/is_undefined");


var EventManagerPrototype;


module.exports = EventManager;


function EventManager() {
    this.propNameToTopLevel = {};
    this.events = {};
}
EventManagerPrototype = EventManager.prototype;

EventManagerPrototype.on = function(id, topLevelType, listener, transaction) {
    var events = this.events,
        event = events[topLevelType] || (events[topLevelType] = {});

    event[id] = listener;
    transaction.event(id, topLevelType);
};
EventManagerPrototype.off = function(id, topLevelType, transaction) {
    var events = this.events,
        event = events[topLevelType];

    if (!isUndefined(event[id])) {
        delete event[id];
        transaction.removeEvent(id, topLevelType);
    }
};
EventManagerPrototype.allOff = function(id, transaction) {
    var events = this.events,
        event, topLevelType;

    for (topLevelType in events) {
        if (!isUndefined((event = events[topLevelType])[id])) {
            delete event[id];
            transaction.removeEvent(id, topLevelType);
        }
    }
};

EventManagerPrototype.globalOn = function(topLevelType, listener) {
    var events = this.events,
        event = events[topLevelType] || (events[topLevelType] = {}),
        global = event.global || (event.global = []),
        index = indexOf(global, listener);

    if (index === -1) {
        global[global.length] = listener;
    }
};
EventManagerPrototype.globalOff = function(topLevelType, listener) {
    var events = this.events,
        event = events[topLevelType] || (events[topLevelType] = {}),
        global = event.global || (event.global = []),
        index = indexOf(global, listener);

    if (index !== -1) {
        global.splice(index, 1);
    }
};
EventManagerPrototype.globalAllOff = function() {
    var events = this.events,
        event = events[topLevelType] || (events[topLevelType] = {}),
        global = event.global;

    if (global) {
        global.length = 0;
    }
};