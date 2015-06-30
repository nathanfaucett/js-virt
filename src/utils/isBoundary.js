module.exports = isBoundary;


function isBoundary(id, index) {
    return id.charAt(index) === "." || index === id.length;
}
