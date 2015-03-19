module.exports = Renderer;


function Renderer() {

    this.adaptor = null;

    this._mountQueue = [];
    this._unmountQueue = [];
    this._updateQueue = [];
}

Renderer.prototype.onMount = function(callback) {
    var queue = this._mountQueue;
    queue[queue.length] = callback;
};

Renderer.prototype.onUnmount = function(callback) {
    var queue = this._unmountQueue;
    queue[queue.length] = callback;
};

Renderer.prototype.onUpdate = function(callback) {
    var queue = this._updateQueue;
    queue[queue.length] = callback;
};

Renderer.prototype._mount = function() {
    var queue = this._mountQueue,
        i = -1,
        il = queue.length - 1;

    while (i++ < il) {
        queue[i]();
    }
    queue.length = 0;
};

Renderer.prototype._unmount = function() {
    var queue = this._unmountQueue,
        i = -1,
        il = queue.length - 1;

    while (i++ < il) {
        queue[i]();
    }
    queue.length = 0;
};

Renderer.prototype._update = function() {
    var queue = this._updateQueue,
        i = -1,
        il = queue.length - 1;

    while (i++ < il) {
        queue[i]();
    }
    queue.length = 0;
};

Renderer.prototype.mount = function(id, view) {
    var _this = this;

    this.adaptor.mount(id, view, function() {
        _this._mount();
    });
};

Renderer.prototype.unmount = function(id) {
    var _this = this;

    this.adaptor.unmount(id, function() {
        _this._unmount();
    });
};

Renderer.prototype.update = function(id, patches) {
    var _this = this;

    this.adaptor.update(id, patches, function() {
        _this._update();
    });
};
