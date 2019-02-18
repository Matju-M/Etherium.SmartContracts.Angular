pragma solidity ^0.5.0;

import "./StoreManagersInterface.sol";

contract Stores { 
    address owner;
    address funds;

    struct StoreItem {
        string image;
        string title;
        uint256 price;
        uint16 quantity;
        bool available;
        bool exist;
    }

    struct Store {
        string name;
        bool active;
        uint256 balance;
        uint64[] itemCodes;
        bool exist;
    }   

    uint16[] storeCodes;
    mapping(uint16 => Store) public stores;
    mapping(uint16 => mapping(uint64 => StoreItem)) public storeItems;

    StoreManagersInterface storeManagers;
    address storeManagersAddress;

    // get the deployed address for StoreManagers contract
    constructor(address storeManagersContractAddress) public { 
        owner = msg.sender;

        /* 
        check that address is not zero, this is a check for a valid address
        since by default it will be zero if not assigned.
        */
        require(storeManagersContractAddress != address(0));
        storeManagersAddress = storeManagersContractAddress;

        /*
         assign it to the interface so that it's easier to determine what calls can be done
         to that contract.
        */
        storeManagers = StoreManagersInterface(storeManagersContractAddress);
    }

    modifier restricted() {
        // calls the store manager to check if the sender is a store manager.
        require(storeManagers.isActiveStoreManager(msg.sender)); _;
    }

    modifier ownerRestricted() { 
        require(owner == msg.sender); _;
    }

    function getAllStoreCodes() public view returns (uint16[] memory) {
        return storeCodes;
    }

    function getAllItemCodes(uint16 storeCode) public view returns (uint64[] memory) {
        return stores[storeCode].itemCodes;
    }

    function add(
        uint16 storeCode, 
        string memory name, 
        bool active, 
        uint256 balance
    ) restricted public payable {

        // check that received values are correct.
        
        require(storeCode >= 0);
        require(!stores[storeCode].exist, "item with this code already exists");
        
        // checks that the name is not empty
        require(bytes(name).length > 0, "name should not be left empty");
        require(balance >= 0, "balance should be greater than 0");

        // add store codes to array, and add mapping with that storecode.
        storeCodes.push(storeCode);
        stores[storeCode].name = name;
        stores[storeCode].active = active;
        stores[storeCode].balance = balance;
        stores[storeCode].exist = true;
    }

    function update(
        uint16 storeCode, 
        string memory name, 
        bool active, 
        uint256 balance
    ) restricted public payable { 
        require(storeCode >= 0);
        require(stores[storeCode].exist, "item should already be available");
        require(bytes(name).length > 0, "image should not be left empty");
        require(balance >= 0, "balance should be greater than 0");

        stores[storeCode].name = name;
        stores[storeCode].active = active;
        stores[storeCode].balance = balance;
    }

    function addItem(
        uint16 storeCode, 
        uint64 code, 
        string memory image, 
        string memory title,
        uint256 price, 
        uint16 quantity, 
        bool available
    ) restricted public payable {
        
        // checks that the data passed is correct
        require(storeCode >= 0);
        require(code >= 0);
        require(!storeItems[storeCode][code].exist, "item with this code already exists");
        require(bytes(image).length > 0, "image should not be left empty");
        require(bytes(title).length > 0, "title should not be left empty");
        require(price >= 0, "price should be 0 or more");
        require(quantity >= 0, "quantity should be 0 or more");

        // add store item to item codes in the store mapping
        stores[storeCode].itemCodes.push(code);

        // add item to the store items mapping.
        storeItems[storeCode][code].image = image;
        storeItems[storeCode][code].title = title;
        storeItems[storeCode][code].price = price;
        storeItems[storeCode][code].quantity = quantity;
        storeItems[storeCode][code].available = available;
        storeItems[storeCode][code].exist = true;
    }

    function updateItem(
        uint16 storeCode, 
        uint64 code, 
        string memory image, 
        string memory title, 
        uint256 price, 
        uint16 quantity, 
        bool available
    ) restricted public payable {
        
        require(code >= 0, "code should be greated than 0");
        require(storeItems[storeCode][code].exist, "item with this code should already exist to update");
        require(bytes(image).length > 0, "image should not be left empty");
        require(bytes(title).length > 0, "title should not be left empty");
        require(price >= 0, "price should be 0 or more");
        require(quantity >= 0, "quantity should be 0 or more");

        // get the values and update
        storeItems[storeCode][code].image = image;
        storeItems[storeCode][code].title = title;
        storeItems[storeCode][code].price = price;
        storeItems[storeCode][code].quantity = quantity;

        // sets to available false if quantity is zero.
        if(quantity == 0){
            available = false;
        }

        storeItems[storeCode][code].available = available;
    }

    function getBalance() ownerRestricted public view returns (uint256) { 
        return address(this).balance;
    }

    function buyItem(
        uint16 storeCode, 
        uint64 code, 
        uint16 quantity
    ) public payable {
        require(storeCode >= 0, "storeCode should be greated than 0");
        require(code >= 0, "code should be greated than 0");
        require(quantity >= 0, "quantity should be 0 or more");

        require(storeItems[storeCode][code].available == true, "item should be available");
        require(storeItems[storeCode][code].exist, "item with this code should already exist to update");
        require(storeItems[storeCode][code].quantity >= quantity, "stock quantity should be more");

        /*
        first withdraw the funds, then reduce quantity from store. 
        This is import due to reentrancy issues.
        */
        withdrawFunds(storeCode, code, quantity);
        
        storeItems[storeCode][code].quantity = storeItems[storeCode][code].quantity - quantity;

        // checks if quantity is zero and changes item status to not available.
        if(storeItems[storeCode][code].quantity == 0){
            storeItems[storeCode][code].available = false;
        }
    }


     function withdrawFunds(
        uint16 storeCode, 
        uint64 code, 
        uint16 quantity
    ) private {
        // calculates the outstanding balance, to be check with the passed value.
        uint256 outstandingBalance = storeItems[storeCode][code].price * quantity;

        require(msg.sender.balance >= outstandingBalance, "Not enough balance!");
        require(outstandingBalance == msg.value, "Oustanding balance does not match");

        // transfer the money to the contract.
        msg.sender.transfer(msg.value); 

        // add balance to the store.
        stores[storeCode].balance += msg.value;
    }

    // function to be called by the owner to transfer funds before deploying a new contract
    function destroy() ownerRestricted public {
        selfdestruct(address(uint160(owner)));
    }

    function() external payable {
        revert();
    }
}