pragma solidity ^0.5.0;

import "./StoreManagersInterface.sol";

contract StoreManagers is StoreManagersInterface { 

    address owner;
    
    address[] storeManagers;
    mapping(address => bool) activeStoreManagers;

    constructor() public {
        owner = msg.sender;
    }
  
    // adding modifier to restrict owner access for several functions.
    modifier restricted() {
        require(msg.sender == owner); _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner;
    }

    /*
     determines if the storeManager address is really an active store manager.
    */    
    function isActiveStoreManager(address storeManager) public view returns (bool){
        bool selectedStoreManager = activeStoreManagers[storeManager];
        return selectedStoreManager;
    }

    function getAll() public view returns (address[] memory){
        return storeManagers;
    }

    // restricted access to add a store manager.
    function add(address manager) restricted public payable {
        storeManagers.push(manager);
        activeStoreManagers[manager] = true;
    }

    // restricted access to remove a store manager from array and mapping
    function remove(uint index) restricted public payable {
        address storeManagerAddress = storeManagers[index];

        // delete both values from mapping and array.
        delete activeStoreManagers[storeManagerAddress];
        delete storeManagers[index];

        // if index is the last item in array, return        
        if (index >= storeManagers.length) return;

        /*
         iterate over each element and move it one up, then reduce the length by 1.
         this is just a simple iteration to clean up the array rather than leaving them
         as blank spaces.
        */
        for (uint i = index; i < storeManagers.length-1; i++){
            storeManagers[i] = storeManagers[i+1];
        }
        storeManagers.length--;
    }

    // fallback function, revert transaction.
    function() external payable {
        revert();
    }

}