const truffleAssert = require('truffle-assertions');
var StoreManagersContract = artifacts.require("StoreManagers");

contract('StoreManagers', function (accounts) {
    let instance;
    let owner = accounts[0];
    let storeOwner = accounts[1];

    beforeEach(async () => {
        instance = await StoreManagersContract.deployed();
    });

    it("should check that when owner, isOwner is true", async () => {
        const result = await instance.isOwner({ from: owner });
        assert.equal(result, true);
    });

    it("should check that when not owner, isOwner is false", async () => {
        const result = await instance.isOwner({ from: storeOwner });
        assert.equal(result, false);
    });
    
    it("should add only when an owner", async () => {
        try {
            truffleAssert.passes(
                await instance.add(storeOwner, {from: owner}),
                "The add should work when an owner is calling it.");
        } catch (e) {
            assert.fail(null, null, e.message);
        }
    });

    it("should not add when caller is not the owner", async () => {
        try {
            let result = await instance.add(storeOwner, {from: storeOwner});
            console.log(">>",result)
            // truffleAssert.passes(
            //     await instance.add(storeOwner, {from: storeOwner}),
            //     "The add should only work for contract owner.");
        } catch (e) {
            assert.fail(null, null, e.message);
        }
    });

});