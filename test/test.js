var assert = require("assert"),
    virt = require("../src/index");


describe("virt(object)", function() {
    it("should return a shallow virt of object", function() {

        assert.deepEqual(virt([1, 2, 3, 4]), [1, 2, 3, 4]);

        assert.deepEqual(virt({
            key: "value"
        }), {
            key: "value"
        });
    });
});
