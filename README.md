virt
=======

virt for the browser and node.js

```javascript
var virt = require("virt");


var root = new virt.Root();

root.adapter = {
    messenger: // implement messenger [read](https://github.com/nathanfaucett/messenger)
    handle: function(transaction, callback) {
        // handle transaction
        callback();
    }
}

root.render(virt.createView("div", {...props}, ...children));
```
