var consts = require("./consts");


module.exports = PropsPatch;


function PropsPatch(id, previous, next) {
    this.type = consts.PROPS;
    this.id = id;
    this.previous = previous;
    this.next = next;
}