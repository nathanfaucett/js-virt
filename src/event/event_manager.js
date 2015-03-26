var indexOf = require("index_of"),
    traverseDescendants = require("../utils/traverse_descendants");


var EventManagerPrototype;


module.exports = EventManager;


function EventManager(root) {
    this.root = root;
    this.__events = {};
}

EventManagerPrototype = EventManager.prototype;


EventManagerPrototype.on = function(id, type, fn) {
    var events = this.__events,
        eventType = events[type] || (events[type] = {}),
        eventList = eventType[id] || (eventType[id] = []);

    eventList[eventList.length] = fn;
};

EventManagerPrototype.off = function(id, type, fn) {
    var events = this.__events,
        eventType = events[type],
        eventList;

    if (eventType !== undefined) {
        eventList = eventType[id];

        if (eventList !== undefined) {
            eventList.splice(indexOf(eventList, fn), 1);
            if (eventList.length === 0) {
                delete events[type];
            }
        }
    }
};

EventManagerPrototype.emit = function(id, type, event) {
    var events = this.__events,
        eventType = events[type],
        adaptor = this.root.adaptor;

    if (eventType !== undefined) {
        traverseDescendants(id, function(id) {
            var eventList = eventType[id];

            if (eventList !== undefined) {
                emit(eventList, event, adaptor);
            }
        });
    }
};

function emit(eventList, event, adaptor) {
    var i = -1,
        il = eventList.length - 1,
        callback;

    while (i++ < il) {
        callback = eventList[i];

        if (callback) {
            adaptor.handleEvent(event, callback);
        }
    }
}
