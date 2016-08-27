var has = require("@nathanfaucett/has"),
    isNull = require("@nathanfaucett/is_null"),
    isPrimitive = require("@nathanfaucett/is_primitive");


module.exports = propsToJSON;


function propsToJSON(props) {
    return toJSON(props, {});
}

function toJSON(props, json) {
    var localHas = has,
        key, value;

    for (key in props) {
        if (localHas(props, key)) {
            value = props[key];

            if (isPrimitive(value)) {
                json = isNull(json) ? {} : json;
                json[key] = value;
            } else {
                value = toJSON(value, null);
                if (!isNull(value)) {
                    json = isNull(json) ? {} : json;
                    json[key] = value;
                }
            }
        }
    }

    return json;
}