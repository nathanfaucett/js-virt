var isObject = require("@nathanfaucett/is_object"),
    getPrototypeOf = require("@nathanfaucett/get_prototype_of"),
    isNull = require("@nathanfaucett/is_null"),
    isNullOrUndefined = require("@nathanfaucett/is_null_or_undefined");


module.exports = diffProps;


function diffProps(id, eventManager, transaction, previous, next) {
    var result = null,
        propNameToTopLevel = eventManager.propNameToTopLevel,
        key, topLevel, previousValue, nextValue, propsDiff;

    for (key in previous) {
        nextValue = next[key];

        if (isNullOrUndefined(nextValue)) {
            result = result || {};
            result[key] = undefined;

            if ((topLevel = propNameToTopLevel[key])) {
                eventManager.off(id, topLevel, transaction);
            }
        } else {
            previousValue = previous[key];

            if (previousValue !== nextValue) {
                result = result || {};
                result[key] = nextValue;
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
            }
        }
    }

    for (key in next) {
        if (isNullOrUndefined(previous[key])) {
            nextValue = next[key];

            result = result || {};
            result[key] = nextValue;

            if ((topLevel = propNameToTopLevel[key])) {
                eventManager.on(id, topLevel, nextValue, transaction);
            }
        }
    }

    return result;
}