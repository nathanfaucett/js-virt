var isNullOrUndefined = require("is_null_or_undefined"),
    getPrototypeOf = require("get_prototype_of"),
    isObject = require("is_object"),
    diffProps = require("./utils/diff_props"),
    View = require("./view");


var isView = View.isView,
    isPrimativeView = View.isPrimativeView;


module.exports = diff;


function diff(previous, next, patches, id) {
    var propsDiff = diffProps(previous.props, next.props);

    if (propsDiff !== null) {
        patches.props(id, previous.props, propsDiff);
    }

    return diffChildren(previous, next, patches, id);
}

function diffChildren(previous, next, patches, parentId) {
    var previousChildren = previous.children,
        nextChildren = reorder(previousChildren, next.children),
        previousLength = previousChildren.length,
        nextLength = nextChildren.length,
        i = -1,
        il = (previousLength > nextLength ? previousLength : nextLength) - 1,
        previousChild, nextChild;

    while (i++ < il) {
        previousChild = previousChildren[i];
        nextChild = nextChildren[i];

        if (isNullOrUndefined(previousChild)) {
            if (!isNullOrUndefined(nextChild)) {
                console.log("insert", nextChild);
            }
        } else {
            if (isPrimativeView(previousChild)) {
                if (isPrimativeView(nextChild)) {
                    if (previousChild !== nextChild) {
                        console.log("replace", previousChild, nextChild);
                    }
                } else {
                    console.log("replace with View");
                }
            } else {
                previousChild.__node.update(nextChild, patches);
            }
        }
    }

    if (nextChildren.moves) {
        console.log("order");
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

        if (child.key != null) {
            keys = keys || {};
            keys[child.key] = i;
        }
    }

    return keys;
}
