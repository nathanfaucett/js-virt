var getViewKey = require("./utils/get_view_key"),
    isNullOrUndefined = require("is_null_or_undefined"),
    getPrototypeOf = require("get_prototype_of"),
    isObject = require("is_object"),
    diffProps = require("./utils/diff_props"),
    View = require("./view"),
    Node;


var isView = View.isView,
    isPrimativeView = View.isPrimativeView;


module.exports = diff;


function diff(root, node, previous, next, patches, id) {
    var propsDiff = diffProps(previous.props, next.props);

    if (propsDiff !== null) {
        patches.props(id, previous.props, propsDiff);
    }

    return diffChildren(root, node, previous, next, patches, id);
}

function diffChildren(root, node, previous, next, patches, parentId) {
    var previousChildren = previous.children,
        nextChildren = reorder(previousChildren, next.children),
        previousLength = previousChildren.length,
        nextLength = nextChildren.length,
        i = -1,
        il = (previousLength > nextLength ? previousLength : nextLength) - 1,
        previousChild, nextChild, childNode, id;

    while (i++ < il) {
        previousChild = previousChildren[i];
        nextChild = nextChildren[i];

        if (isNullOrUndefined(previousChild)) {
            if (!isNullOrUndefined(nextChild)) {
                insert(node, nextChild, parentId, i);
            }
        } else if (isPrimativeView(previousChild)) {
            if (isPrimativeView(nextChild)) {
                if (previousChild !== nextChild) {
                    patches.text(parentId, i, nextChild);
                }
            } else {
                replace(node, nextChild, parentId, i);
            }
        } else {
            if (isNullOrUndefined(nextChild)) {
                id = parentId + "." + getViewKey(previousChild, i);
                childNode = root.childHash[id];
                childNode.unmount(i);
            } else if (isPrimativeView(nextChild)) {
                if (isPrimativeView(nextChild)) {
                    if (previousChild !== nextChild) {
                        patches.text(parentId, i, nextChild);
                    }
                } else {
                    replace(node, nextChild, parentId, i);
                }
            } else {
                id = parentId + "." + getViewKey(previousChild, i);
                childNode = root.childHash[id];
                childNode.__update(nextChild, patches);
            }
        }
    }

    if (nextChildren.moves) {
        patches.order(parentId, nextChildren.moves);
    }
}

Node = require("./node");

function insert(parentNode, nextChild, parentId, index) {
    var node = Node.create(nextChild);

    node.id = parentId + "." + getViewKey(nextChild, index);
    parentNode.appendNode(node);
    node.mount(index);
}

function replace(parentNode, nextChild, parentId, index) {
    var node = Node.create(nextChild);

    node.id = parentId + "." + getViewKey(nextChild, index);
    parentNode.appendNode(node);
    node.mount(index);
}

function reorder(previousChildren, nextChildren) {
    var previousKeys, nextKeys, previousMatch, nextMatch, key, previousLength, nextLength,
        length, shuffle, freeIndex, i, moveIndex, moves, removes, reverse, hasMoves, move, freeChild;

    nextKeys = keyIndex(nextChildren);
    if (nextKeys === null) {
        return nextChildren;
    }

    previousKeys = keyIndex(previousChildren);
    if (previousKeys === null) {
        return nextChildren;
    }

    nextMatch = {};
    previousMatch = {};

    for (key in nextKeys) {
        nextMatch[nextKeys[key]] = previousKeys[key];
    }

    for (key in previousKeys) {
        previousMatch[previousKeys[key]] = nextKeys[key];
    }

    previousLength = previousChildren.length;
    nextLength = nextChildren.length;
    length = previousLength > nextLength ? previousLength : nextLength;
    shuffle = [];
    freeIndex = 0;
    i = 0;
    moveIndex = 0;
    moves = {};
    removes = moves.removes = {};
    reverse = moves.reverse = {};
    hasMoves = false;

    while (freeIndex < length) {
        move = previousMatch[i];

        if (move !== undefined) {
            shuffle[i] = nextChildren[move];

            if (move !== moveIndex) {
                moves[move] = moveIndex;
                reverse[moveIndex] = move;
                hasMoves = true;
            }

            moveIndex++;
        } else if (i in previousMatch) {
            shuffle[i] = undefined;
            removes[i] = moveIndex++;
            hasMoves = true;
        } else {
            while (nextMatch[freeIndex] !== undefined) {
                freeIndex++;
            }

            if (freeIndex < length) {
                freeChild = nextChildren[freeIndex];

                if (freeChild) {
                    shuffle[i] = freeChild;
                    if (freeIndex !== moveIndex) {
                        hasMoves = true;
                        moves[freeIndex] = moveIndex;
                        reverse[moveIndex] = freeIndex;
                    }
                    moveIndex++;
                }
                freeIndex++;
            }
        }
        i++;
    }

    if (hasMoves) {
        shuffle.moves = moves;
    }

    return shuffle;
}

function keyIndex(children) {
    var i = -1,
        il = children.length - 1,
        keys = null,
        child;

    while (i++ < il) {
        child = children[i];

        if (child.key != null) {
            keys = keys || {};
            keys[child.key] = i;
        }
    }

    return keys;
}
