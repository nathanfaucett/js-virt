var View = require("./View");


var virt = exports;


virt.Root = require("./Root");
virt.Component = require("./Component");

virt.View = View;
virt.cloneView = View.clone;
virt.createView = View.create;
virt.createFactory = View.createFactory;

virt.getChildKey = require("./utils/getChildKey");
virt.getRootIdFromId = require("./utils/getRootIdFromId");

virt.consts = require("./Transaction/consts");

virt.isAncestorIdOf = require("./utils/isAncestorIdOf");
virt.traverseAncestors = require("./utils/traverseAncestors");
virt.traverseDescendants = require("./utils/traverseDescendants");
virt.traverseTwoPhase = require("./utils/traverseTwoPhase");

virt.context = require("./context");
virt.owner = require("./owner");