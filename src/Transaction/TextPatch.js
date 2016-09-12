var propsToJSON = require("../utils/propsToJSON"),
    consts = require("./consts");


var TextPatchPrototype;


module.exports = TextPatch;


function TextPatch(id, index, next, props) {
    this.type = consts.TEXT;
    this.id = id;
    this.index = index;
    this.next = next;
    this.props = props;
}
TextPatchPrototype = TextPatch.prototype;

TextPatchPrototype.toJSON = function() {
    return {
        type: this.type,
        id: this.id,
        index: this.index,
        next: this.next,
        props: propsToJSON(this.props)
    };
};