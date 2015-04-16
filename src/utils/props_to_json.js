var has = require("has"),
    isFunction = require("is_function");


module.exports = propsToJSON;


function propsToJSON(props) {
    var json = {},
        key, value;

    for (key in props) {
        if (has(props, key)) {
            value = props[key];

            if (!isFunction(value)) {
                json[key] = value;
            }
        }
    }

    return json;
}
