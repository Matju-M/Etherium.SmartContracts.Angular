var StoreManagers = artifacts.require("./StoreManagers.sol");
var Stores = artifacts.require("./Stores.sol");

module.exports = function (deployer) {
  deployer.deploy(StoreManagers).then(function () {
    return deployer.deploy(Stores, StoreManagers.address);
  });

}
