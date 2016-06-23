virt
======

virt is a tool for creating interactive UIs. Use views for each state in your application, and virt will find the differences and create a JSON object of the changes.

use of a renderer for the JSON is nesseecary the only one aviable right now is [virt-dom](https://github.com/nathanfaucett/virt-dom)

Example
====
```javascript
var virt = require("virt");


var root = new virt.Root();

root.adapter = {
    messenger: // implement messenger [read](https://github.com/nathanfaucett/messenger)
}

root.render(virt.createView("div", {...props}, ...children));
```
