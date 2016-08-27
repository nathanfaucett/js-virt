var isString = require("@nathanfaucett/is_string"),
    isNumber = require("@nathanfaucett/is_number"),
    isNullOrUndefined = require("@nathanfaucett/is_null_or_undefined");


module.exports = shouldUpdate;


function shouldUpdate(previous, next) {
    if (isNullOrUndefined(previous) || isNullOrUndefined(next)) {
        return false;
    } else {
        if (isString(previous) || isNumber(previous)) {
            return isString(next) || isNumber(next);
        } else {
            return (
                previous.type === next.type &&
                previous.key === next.key
            );
        }
    }
}