var EventManagerPrototype;


module.exports = EventManager;


function EventManager() {
    this.propNameToTopLevel = {};
    this.__events = {};
}

EventManagerPrototype = EventManager.prototype;

EventManagerPrototype.on = function(id, topLevelType, listener, transaction) {
    var events = this.__events,
        event = events[topLevelType] || (events[topLevelType] = {});

    event[id] = listener;
    transaction.event(id, topLevelType);
};

EventManagerPrototype.off = function(id, topLevelType, transaction) {
    var events = this.__events,
        event = events[topLevelType];

    if (event[id] !== undefined) {
        delete event[id];
        transaction.removeEvent(id, topLevelType);
    }
};

EventManagerPrototype.get = function(id, topLevelType) {
    var events = this.__events,
        event = events[topLevelType];

    if (event !== undefined) {
        return event[id];
    } else {
        return null;
    }
};

EventManagerPrototype.allOff = function(id, transaction) {
    var events = this.__events,
        event, topLevelType;

    for (topLevelType in events) {
        if ((event = events[topLevelType])[id] !== undefined) {
            delete event[id];
            transaction.removeEvent(id, topLevelType);
        }
    }
};
