virt
=======

virt for the browser and node.js

```javascript
var virt = require("virt");


var root = new virt.Root();

root.adaptor = {
    handle: function(transaction, callback) {
        // handle transaction
        callback();
    }
}

root.render(virt.createView("div", {...props}, ...children));
```
