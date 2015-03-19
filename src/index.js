var View = require("./view");


var virt = exports;


virt.Root = require("./tree/root");
virt.render = require("./render");

virt.Component = require("./component");

virt.View = View;
virt.createView = View.create;
virt.createFactory = View.createFactory;
