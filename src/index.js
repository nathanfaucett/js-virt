var View = require("./view");


var virt = exports;


virt.Root = require("./root");

virt.Component = require("./component");

virt.View = View;
virt.cloneView = View.clone;
virt.createView = View.create;
virt.createFactory = View.createFactory;

virt.consts = require("./transaction/consts");

virt.getChildKey = require("./utils/get_child_key");

virt.registerNativeComponent = require("./utils/register_native_component");

virt.traverseAncestors = require("./utils/traverse_ancestors");
virt.traverseDescendants = require("./utils/traverse_descendants");
virt.traverseTwoPhase = require("./utils/traverse_two_phase");

virt.context = require("./context");
virt.owner = require("./owner");
