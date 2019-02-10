pragma solidity ^0.5.0;

contract StoreManagers { 

    address owner;
    
    address[] storeManagers;

    constructor() public {
        owner = msg.sender;
    }
  
    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function amITheOwner() public view returns (bool) {
        return msg.sender == owner;
    }
    
    function getAll() public view returns (address[] memory){
        return storeManagers;
    }

    function add(address manager) restricted public payable returns (address[] memory){
        storeManagers.push(manager);
        return storeManagers;
    }

    function remove(uint index) restricted public payable returns (address[] memory){
        delete storeManagers[index];
        if (index >= storeManagers.length) return storeManagers;

        for (uint i = index; i < storeManagers.length-1; i++){
            storeManagers[i] = storeManagers[i+1];
        }
        storeManagers.length--;

        return storeManagers;
    }

    function() external payable {
        revert();
    }

}