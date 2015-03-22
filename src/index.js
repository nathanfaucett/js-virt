var View = require("./view");


var virt = exports;


virt.Root = require("./root");

virt.Component = require("./component");

virt.View = View;
virt.createView = View.create;
virt.createFactory = View.createFactory;
