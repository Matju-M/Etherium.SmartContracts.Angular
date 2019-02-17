pragma solidity ^0.5.0;

import "./StoreManagersInterface.sol";

contract StoreManagers is StoreManagersInterface { 

    address owner;
    
    address[] storeManagers;
    mapping(address => bool) activeStoreManagers;

    constructor() public {
        owner = msg.sender;
    }
  
    modifier restricted() {
        require(msg.sender == owner); _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    function isActiveStoreManager(address storeManager) public view returns (bool){
        bool selectedStoreManager = activeStoreManagers[storeManager];
        return selectedStoreManager;
    }

    function getAll() public view returns (address[] memory){
        return storeManagers;
    }

    function add(address manager) restricted public payable {
        storeManagers.push(manager);
        activeStoreManagers[manager] = true;
    }

    function remove(uint index) restricted public payable {
        address storeManagerAddress = storeManagers[index];
        activeStoreManagers[storeManagerAddress] = false;

        delete storeManagers[index];
        if (index >= storeManagers.length) return;

        for (uint i = index; i < storeManagers.length-1; i++){
            storeManagers[i] = storeManagers[i+1];
        }
        storeManagers.length--;
    }

    function() external payable {
        revert();
    }

}