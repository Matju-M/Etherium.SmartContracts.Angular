var StoreManagers = artifacts.require("StoreManagers");
var Stores = artifacts.require("Stores");

module.exports = function (deployer) {
  deployer.deploy(StoreManagers).then(function () {
    return deployer.deploy(Stores, StoreManagers.address);
  });

}
