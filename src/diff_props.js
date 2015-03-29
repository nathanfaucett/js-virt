var indexOf = require("index_of"),
    isObject = require("is_object"),
    getPrototypeOf = require("get_prototype_of"),
    isNullOrUndefined = require("is_null_or_undefined");


module.exports = diffProps;


function diffProps(id, eventManager, transaction, previous, next) {
    var result = null,
        eventPropNames = eventManager.propNames,
        key, previousValue, nextValue, propsDiff;

    for (key in previous) {
        nextValue = next[key];

        if (isNullOrUndefined(nextValue)) {
            result = result || {};
            result[key] = undefined;

            if (indexOf(eventPropNames, key) !== -1) {
                eventManager.off(id, key, transaction);
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
                    propsDiff = diffProps(id, eventManager, transaction, previousValue, nextValue);
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
            nextValue = next[key];

            result = result || {};
            result[key] = nextValue;

            if (indexOf(eventPropNames, key) !== -1) {
                eventManager.on(id, key, nextValue, transaction);
            }
        }
    }

    return result;
}
