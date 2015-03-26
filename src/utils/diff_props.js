var has = require("has"),
    isObject = require("is_object"),
    getPrototypeOf = require("get_prototype_of"),
    isNullOrUndefined = require("is_null_or_undefined"),
    events = require("../event/events");


module.exports = diffProps;


function diffProps(id, eventManager, previous, next) {
    var result = null,
        key, previousValue, nextValue, propsDiff;

    for (key in previous) {
        nextValue = next[key];

        if (isNullOrUndefined(nextValue)) {
            result = result || {};
            result[key] = undefined;

            if (has(events, key)) {
                eventManager.off(id, events[key], previous[key]);
            }
        } else {
            previousValue = previous[key];

            if (previousValue === nextValue) {
                continue;
            } else if (isObject(previousValue) && isObject(nextValue)) {
                if (getPrototypeOf(previousValue) !== getPrototypeOf(nextValue)) {
                    result = result || {};
                    result[key] = nextValue;
                } else {
                    propsDiff = diffProps(id, eventManager, previousValue, nextValue);
                    if (propsDiff !== null) {
                        result = result || {};
                        result[key] = propsDiff;
                    }
                }
            } else {
                result = result || {};
                result[key] = nextValue;
            }
        }
    }

    for (key in next) {
        if (isNullOrUndefined(previous[key])) {
            result = result || {};
            result[key] = next[key];

            if (has(events, key)) {
                eventManager.on(id, events[key], next[key]);
            }
        }
    }

    return result;
}
