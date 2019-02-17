const truffleAssert = require('truffle-assertions');
const StoresContract = artifacts.require("Stores");
const StoreManagersContract = artifacts.require("StoreManagers");

contract('StoreManagers', function (accounts) {
    let instance;
    let storeManagersInstance;
    let owner = accounts[0];
    let storeManager = accounts[1];
    let shopper = accounts[2];

    beforeEach(async () => {
        instance = await StoresContract.deployed();
        storeManagersInstance = await StoreManagersContract.deployed();
    });

    it("should add a new store code", async () => {
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

        const storeCodes = (await instance.getAllStoreCodes()).map(x=> x.toNumber());
        assert.equal(storeCodes.length, 1, "Should have one store code");

        const store = await instance.stores.call(1);
        
        assert.equal(store[0], "Test Store", "Store should have the name Test Store");
        assert.isTrue(store[1], "Store should be active");
        assert.equal(store[2].toNumber(), 12, "Balance should have a value of 1")
    });

    it("should update a store", async () => {
        await truffleAssert.passes(
            instance.update(1, "Store", false, 11, { from: storeManager }),
            "Store should be updated when requested by store manager"
        );

        await truffleAssert.fails(
            instance.update(2, "Store", false, 11, { from: owner }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store should not be updated when requested by owner"
        );

        await truffleAssert.fails(
            instance.update(3, "Store", false, 11, { from: shopper }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store should not be updated when requested by shopper"
        );

        const storeCodes = (await instance.getAllStoreCodes()).map(x=> x.toNumber());
        assert.equal(storeCodes.length, 1, "Should have one store code");

        const store = await instance.stores.call(1);
        
        assert.equal(store[0], "Store", "Store should have the name Test Store");
        assert.isFalse(store[1], "Store should be active");
        assert.equal(store[2].toNumber(), 11, "Balance should have a value of 1")
    })

    it("should add an item in store", async ()=> {

        await truffleAssert.passes(
            instance.addItem(1, 1, "www.test.com","pr1", 11, 12, true, { from: storeManager }),
            "Store Item should be updated when requested by store manager"
        );

        await truffleAssert.fails(
            instance.addItem(1, 1, "www.test.com","pr1", 11, 12, true, { from: owner }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store Item should not be updated when requested by owner"
        );

        await truffleAssert.fails(
            instance.addItem(1, 1, "www.test.com","pr1", 11, 12, true, { from: shopper }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store Item should not be updated when requested by owner"
        );

        const storeItemCodes = (await instance.getAllItemCodes(1)).map(x=> x.toNumber());
        assert.equal(storeItemCodes.length, 1, "Should have one store item code");

        const storeItem = await instance.storeItems.call(1, storeItemCodes[0]);
        
        assert.equal(storeItem[0], "www.test.com", "image should be set to www.test.com");
        assert.equal(storeItem[1], "pr1", "title should be set to 'pr1'");
        assert.equal(storeItem[2].toNumber(), 11, "price should be set to 11");
        assert.equal(storeItem[3].toNumber(), 12, "quantity should be set to 12");
        assert.isTrue(storeItem[4], "Available should be true");
    });

    it("should update an item in store", async ()=> {

        await truffleAssert.passes(
            instance.updateItem(1, 1, "www.updated.com","pr2", 12, 13, false, { from: storeManager }),
            "Store Item should be updated when requested by store manager"
        );

        await truffleAssert.fails(
            instance.updateItem(1, 1, "www.updated.com","pr2", 12, 13, false, { from: owner }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store Item should not be updated when requested by owner"
        );

        await truffleAssert.fails(
            instance.updateItem(1, 1, "www.updated.com","pr2", 12, 13, false, { from: shopper }),
            truffleAssert.ErrorType.REVERT,
            null,
            "Store Item should not be updated when requested by owner"
        );

        const storeItemCodes = (await instance.getAllItemCodes(1)).map(x=> x.toNumber());
        assert.equal(storeItemCodes.length, 1, "Should have one store item code");

        const storeItem = await instance.storeItems.call(1, storeItemCodes[0]);
        
        assert.equal(storeItem[0], "www.updated.com", "image should be set to www.test.com");
        assert.equal(storeItem[1], "pr2", "title should be set to 'pr1'");
        assert.equal(storeItem[2].toNumber(), 12, "price should be set to 11");
        assert.equal(storeItem[3].toNumber(), 13, "quantity should be set to 12");
        assert.isFalse(storeItem[4], "Available should be false");
    });

    
    it("should buy item and reduce quantity", async () => {
        instance.updateItem(1, 1, "www.updated.com","pr2", 1, 1, true, { from: storeManager });

        await truffleAssert.passes(
            instance.buyItem(1, 1, 1, { from: shopper, value: 1}),
            "Store item should be bought"
        );

        let storeItem = await instance.storeItems.call(1, 1);
        assert.isFalse(storeItem[4], "Available should be false");
    })

});