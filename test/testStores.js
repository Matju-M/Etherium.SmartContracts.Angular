const truffleAssert = require('truffle-assertions');
var StoresContract = artifacts.require("Stores");

contract('StoreManagers', function (accounts) { 
    let instance;
    let owner = accounts[0];
    let storeOwner = accounts[1];
    let shopper = accounts[2];

    beforeEach(async ()=>{
        instance = await Stores.deployed();
    })

    

});