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
    }   

    uint16[] storeCodes;
    mapping(uint16 => Store) public stores;
    mapping(uint16 => mapping(uint64 => StoreItem)) public storeItems;

    StoreManagersInterface storeManagers;
    address storeManagersAddress;

    event log(address sender, bool found, string text);

    constructor(address storeManagersContractAddress) public { 
        owner = msg.sender;

        require(storeManagersContractAddress != address(0));
        storeManagersAddress = storeManagersContractAddress;
        storeManagers = StoreManagersInterface(storeManagersContractAddress);
    }

    modifier restricted() {
        require(storeManagers.isActiveStoreManager(msg.sender)); _;
    }

    modifier ownerRestricted() { 
        require(owner == msg.sender); _;
    }

    function getAllStoreCodes() public view returns ( uint16[] memory) {
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
        require(storeCode >= 0);
        require(keccak256(abi.encode(stores[storeCode].name)) > 0, "item with this code already exists");
        require(keccak256(abi.encode(name)) > 0, "image should not be left empty");

        storeCodes.push(storeCode);
        stores[storeCode].name = name;
        stores[storeCode].active = active;
        stores[storeCode].balance = balance;
    }

    function update(
        uint16 storeCode, 
        string memory name, 
        bool active, 
        uint256 balance
    ) restricted public payable { 
        require(storeCode >= 0);
        require(keccak256(abi.encode(stores[storeCode].name)) > 0, "item should already be available");
        require(keccak256(abi.encode(name)) > 0, "image should not be left empty");

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
        
        require(storeCode >= 0);
        require(code >= 0);
        require(!storeItems[storeCode][code].exist, "item with this code already exists");
        require(keccak256(abi.encode(image)) > 0, "image should not be left empty");
        require(keccak256(abi.encode(title)) > 0, "title should not be left empty");
        require(price >= 0, "price should be 0 or more");
        require(quantity >= 0, "quantity should be 0 or more");

        stores[storeCode].itemCodes.push(code);

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
        require(keccak256(abi.encode(image)) > 0, "image should not be left empty");
        require(keccak256(abi.encode(title)) > 0, "title should not be left empty");
        require(price >= 0, "price should be 0 or more");
        require(quantity >= 0, "quantity should be 0 or more");

        storeItems[storeCode][code].image = image;
        storeItems[storeCode][code].title = title;
        storeItems[storeCode][code].price = price;
        storeItems[storeCode][code].quantity = quantity;

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
         require(code >= 0, "code should be greated than 0");
        require(storeItems[storeCode][code].available == true, "item should be available");
        require(storeItems[storeCode][code].exist, "item with this code should already exist to update");
        require(storeItems[storeCode][code].quantity >= quantity, "stock quantity should be more");
        require(quantity >= 0, "quantity should be 0 or more");
        
        withdrawFunds(storeCode, code, quantity);
        storeItems[storeCode][code].quantity = storeItems[storeCode][code].quantity - quantity;

        if(storeItems[storeCode][code].quantity == 0){
            storeItems[storeCode][code].available = false;
        }
    }

     function withdrawFunds(
        uint16 storeCode, 
        uint64 code, 
        uint16 quantity
    ) private {
        uint256 outstandingBalance = storeItems[storeCode][code].price * quantity;

        // address payable payableOwner = address(uint160(owner));       

        require(msg.sender.balance >= outstandingBalance, "Not enough balance!");
        require(outstandingBalance == msg.value, "Oustanding balance does not match");

        // payableOwner.transfer(msg.value);
        // payableOwner = msg.sender;
        msg.sender.transfer(msg.value); // transfer funds;
        stores[storeCode].balance += msg.value;
    }

    function destroy() ownerRestricted public {
        selfdestruct(address(uint160(owner)));
    }

    function() external payable {
        revert();
    }
}