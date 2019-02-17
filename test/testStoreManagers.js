const truffleAssert = require('truffle-assertions');
var StoreManagersContract = artifacts.require("StoreManagers");

contract('StoreManagers', function (accounts) {
    let instance;
    let owner = accounts[0];
    let storeManager = accounts[1];

    before(async () => {
        instance = await StoreManagersContract.deployed();

        // Cleanup before starting test
        const storeManagers = await instance.getAll();
        for (var index in storeManagers) {
            await storeManagers.remove(index, { from: owner });
        }

    });

    it("should check that when owner, isOwner is true", async () => {
        const result = await instance.isOwner({ from: owner });
        assert.equal(result, true);
    });

    it("should check that when not owner, isOwner is false", async () => {
        const result = await instance.isOwner({ from: storeManager });
        assert.equal(result, false);
    });

    it("should add only when an owner", async () => {
        await truffleAssert.passes(
            instance.add(storeManager, { from: owner }),
            "the add should work only for contract owner");

        const managers = (await instance.getAll()).length;
        assert.equal(managers, 1, "Only one store manager should be saved!");
    });

    it("should not add when caller is not the owner", async () => {
        await truffleAssert.fails(
            instance.add(storeManager, { from: storeManager }),
            truffleAssert.ErrorType.REVERT,
            null,
            "The add should only work for contract owner.");
    });

    it("should have an active store manager", async () => {
        assert.equal(await instance.isActiveStoreManager(storeManager), true, "Store Manager should be active");

        assert.equal(await instance.isActiveStoreManager(owner), false, "Owner should not be Store Manager")
    });

    it("should remove only when an owner", async () => {
        let managers = (await instance.getAll()).length;
        assert.equal(managers, 1, "1 store manager should already be added");
        await truffleAssert.passes(
            instance.remove(0, { from: owner }),
            "the remove should work only for contract owner."
        )
        managers = (await instance.getAll()).length;
        assert.equal(managers, 0, "No store managers should be saved");
    });

});