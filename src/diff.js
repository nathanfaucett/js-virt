var getViewKey = require("./utils/get_view_key"),
    shouldUpdate = require("./utils/should_update"),
    isNullOrUndefined = require("is_null_or_undefined"),
    diffProps = require("./utils/diff_props"),
    View = require("./view"),
    Node;


var isPrimativeView = View.isPrimativeView;


module.exports = diff;


Node = require("./node");


function diff(node, previous, next, patches) {
    var propsDiff = diffProps(previous.props, next.props);

    if (propsDiff !== null) {
        patches.props(node.id, previous.props, propsDiff);
    }

    return diffChildren(node, previous, next, patches);
}

function diffChildren(node, previous, next, patches) {
    var previousChildren = previous.children,
        nextChildren = reorder(previousChildren, next.children),
        previousLength = previousChildren.length,
        nextLength = nextChildren.length,
        parentId = node.id,
        i = -1,
        il = (previousLength > nextLength ? previousLength : nextLength) - 1;

    while (i++ < il) {
        diffChild(node, previousChildren[i], nextChildren[i], patches, parentId, i);
    }

    if (nextChildren.moves) {
        patches.order(parentId, nextChildren.moves);
    }
}

function diffChild(parentNode, previousChild, nextChild, patches, parentId, index) {
    var node, id;

    if (previousChild !== nextChild) {
        if (isNullOrUndefined(previousChild)) {
            if (isPrimativeView(nextChild)) {
                patches.insert(parentId, null, index, nextChild);
            } else {
                node = Node.create(nextChild);
                id = node.id = parentId + "." + getViewKey(nextChild, index);
                parentNode.appendNode(node);
                patches.insert(parentId, id, index, node.__renderRecurse(patches));
            }
        } else if (isPrimativeView(previousChild)) {
            if (isNullOrUndefined(nextChild)) {
                patches.remove(parentId, null, index);
            } else if (isPrimativeView(nextChild)) {
                patches.text(parentId, index, nextChild);
            } else {
                node = Node.create(nextChild);
                id = node.id = parentId + "." + getViewKey(nextChild, index);
                parentNode.appendNode(node);
                patches.replace(parentId, id, index, node.__renderRecurse(patches));
            }
        } else {
            if (isNullOrUndefined(nextChild)) {
                id = parentId + "." + getViewKey(previousChild, index);
                node = parentNode.root.childHash[id];
                node.unmount(patches);
            } else if (isPrimativeView(nextChild)) {
                patches.replace(parentId, null, index, nextChild);
            } else {
                id = parentId + "." + getViewKey(previousChild, index);
                node = parentNode.root.childHash[id];

                if (node) {
                    if (shouldUpdate(previousChild, nextChild)) {
                        node.update(nextChild, patches);
                        return;
                    } else {
                        node.unmount(patches);
                    }
                }

                node = Node.create(nextChild);
                id = node.id = parentId + "." + getViewKey(nextChild, index);
                parentNode.appendNode(node);
                patches.insert(parentId, id, index, node.__renderRecurse(patches));
            }
        }
    }
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

        if (!isNullOrUndefined(child.key)) {
            keys = keys || {};
            keys[child.key] = i;
        }
    }

    return keys;
}
