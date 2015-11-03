var has = require("has"),
    isObject = require("is_object"),
    getPrototypeOf = require("get_prototype_of"),
    isNull = require("is_null"),
    isNullOrUndefined = require("is_null_or_undefined");


module.exports = diffProps;


function diffProps(id, eventManager, transaction, previous, next) {
    var result = null,
        localHas = has,
        propNameToTopLevel = eventManager.propNameToTopLevel,
        key, previousValue, nextValue, propsDiff;

    for (key in previous) {
        nextValue = next[key];

        if (isNullOrUndefined(nextValue)) {
            result = result || {};
            result[key] = undefined;

            if (localHas(propNameToTopLevel, key)) {
                eventManager.off(id, propNameToTopLevel[key], transaction);
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
                    if (!isNull(propsDiff)) {
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

            if (localHas(propNameToTopLevel, key)) {
                eventManager.on(id, propNameToTopLevel[key], nextValue, transaction);
            }
        }
    }

    return result;
}
