pragma solidity ^0.5.0;

interface StoreManagersInterface {
    function isActiveStoreManager(address storeManager) external view returns (bool);
}
