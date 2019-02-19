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

    /**
     * checks that isOwner function returns true only for owner
     */
    it("should check that when owner, isOwner is true", async () => {
        let result = await instance.isOwner({ from: owner });
        assert.equal(result, true);

        result = await instance.isOwner({ from: storeManager });
        assert.equal(result, false);
    });

    /**
     * checks that a store manager can be added only by owner
     */
    it("should add only when an owner", async () => {
        await truffleAssert.passes(
            instance.add(storeManager, { from: owner }),
            "the add should work only for contract owner");

        await truffleAssert.fails(
            instance.add(storeManager, { from: storeManager }),
            truffleAssert.ErrorType.REVERT,
            null,
            "The add should only work for contract owner.");
    });

    /**
     * checks that only 1 store manager is saved, with the store manager account
     */
    it("should have only 1 store manager saved", async () => {
        const managers = await instance.getAll();

        assert.equal(managers[0], storeManager, "Store manager account does not match");
        assert.equal(managers.length, 1, "Only one store manager should be saved!");
    });

    /**
     * Checks if the passed address is an active store manager
     */
    it("should have an active store manager", async () => {
        assert.equal(await instance.isActiveStoreManager(storeManager), true, "Store Manager should be active");

        assert.equal(await instance.isActiveStoreManager(owner), false, "Owner should not be Store Manager")
    });

    /**
     * updates a store manager, checks value in mapping
     */
    it("should update a store manager", async () => {
        await truffleAssert.passes(
            instance.update(storeManager, false, { from: owner }),
            "the update should work only for contract owner");

        await truffleAssert.fails(
            instance.update(storeManager, false, { from: storeManager }),
            truffleAssert.ErrorType.REVERT,
            null,
            "the update should not work for store manager");
        
            assert.equal(await instance.isActiveStoreManager(storeManager), false, "Store Manager should be not be active");
    })

    /**
     *  checks that a store manager can be removed only by the owner
     */
    it("should remove only when an owner", async () => {
        let managers = (await instance.getAll()).length;
        assert.equal(managers, 1, "1 store manager should already be added");

        await truffleAssert.fails(
            instance.remove(0, { from: storeManager }),
            truffleAssert.ErrorType.REVERT,
            null,
            "the remove should work only for contract owner."
        )

        await truffleAssert.passes(
            instance.remove(0, { from: owner }),
            "the remove should work only for contract owner."
        )
        managers = (await instance.getAll()).length;
        assert.equal(managers, 0, "No store managers should be saved");
    });

});