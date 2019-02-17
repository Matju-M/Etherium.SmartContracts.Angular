const truffleAssert = require('truffle-assertions');
const StoresContract = artifacts.require("Stores");
const StoreManagersContract = artifacts.require("StoreManagers");

contract('StoreManagers', function (accounts) {
    let instance;
    let storeManagersInstance;
    let owner = accounts[0];
    let storeManager = accounts[1];
    let shopper = accounts[2];

    before(async () => {
        instance = await StoresContract.deployed();
        storeManagersInstance = await StoreManagersContract.deployed();
    });

    it("add a new store code", async () => {
        await truffleAssert.passes(
            storeManagersInstance.add(storeManager, { from: owner }),
            "Store Owner should be added when requested by owner"
        );

        const managers = await storeManagersInstance.getAll();
        assert.equal(managers.length, 1, "Should have at least one store manager");

        await truffleAssert.passes(
            instance.add(1, "Test Store", true, 12, { from: storeManager }),
            "Store should be added when requested by store manager"
        );

        await truffleAssert.fails(
            instance.add(2, "Test Store", true, 1, { from: owner }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store should not be added when requested by owner"
        );

        await truffleAssert.fails(
            instance.add(3, "Test Store", true, 1, { from: shopper }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store should not be added when requested by shopper"
        );
    });


});