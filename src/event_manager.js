var EventManagerPrototype;


module.exports = EventManager;


function EventManager() {
    this.propNames = [];
    this.__events = {};
}

EventManagerPrototype = EventManager.prototype;

EventManagerPrototype.on = function(id, type, listener, transaction) {
    var events = this.__events,
        event = events[type] || (events[type] = {});

    event[id] = listener;
    transaction.event(id, type);
};

EventManagerPrototype.off = function(id, type, transaction) {
    var events = this.__events,
        event = events[type];

    if (event[id] !== undefined) {
        delete event[id];
        transaction.removeEvent(id, type);
    }
};

EventManagerPrototype.get = function(id, type) {
    var events = this.__events,
        event = events[type];

    if (event !== undefined) {
        return event[id];
    } else {
        return null;
    }
};

EventManagerPrototype.allOff = function(id, transaction) {
    var events = this.__events,
        event, type;

    for (type in events) {
        if ((event = events[type])[id] !== undefined) {
            delete event[id];
            transaction.removeEvent(id, type);
        }
    }
};
