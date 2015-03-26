var virt = require("../src/index");


var app = document.getElementById("app");


function renderSpan(content) {
    return virt.createView("span", content);
}

function renderCount(count) {
    var list = [],
        i = count;

    while (i--) {
        list[list.length] = renderSpan(i);
    }

    list.unshift(renderSpan(count));

    return (
        virt.createView("p", {
            className: "count " + count
        }, list)
    );
}

function renderCounter(count) {
    return (
        virt.createView("div", {
            className: "counter " + count
        }, renderCount(count))
    );
}

var root = global.root = new virt.Root({
    handle: function(transaction, callback) {
        callback();
    }
});

root.render(renderCounter(0));

var dir = 1,
    count = 0;

function render() {
    if (dir === 1 && count >= 5) {
        dir = -1;
    } else if (dir === -1 && count <= 0) {
        dir = 1;
    }

    count += dir;

    root.render(renderCounter(count));
    window.requestAnimationFrame(render, app);
}

//render();
