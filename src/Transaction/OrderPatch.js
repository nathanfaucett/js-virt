var consts = require("./consts");


module.exports = OrderPatch;


function OrderPatch(id, order) {
    this.type = consts.ORDER;
    this.id = id;
    this.order = order;
}