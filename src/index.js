var View = require("./view");


var virt = exports;


virt.Root = require("./root");

virt.Component = require("./component");

virt.View = View;
virt.createView = View.create;
virt.createFactory = View.createFactory;

virt.registerNativeComponent = require("./utils/register_native_component");
virt.context = require("./context");
virt.owner = require("./owner");
