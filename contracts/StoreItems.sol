pragma solidity ^0.5.0;

interface StoreManagersInterface {
    function isActiveStoreManager(address storeManager) external view returns (bool);
}

contract StoreItems { 

    address owner;

    struct Item {
        string image;
        string title;
        uint256 price;
        uint16 quantity;
        bool available;
        bool exist;
    }

    mapping(uint64 => Item) public itemsMapping;
    uint64[] itemCodes;
    StoreManagersInterface storeManagers;

    constructor(address storeManagersContractAddress) public {
        owner = msg.sender;

        require(storeManagersContractAddress != address(0));
        storeManagers = StoreManagersInterface(storeManagersContractAddress);
    }

    modifier restricted() {
        if (storeManagers.isActiveStoreManager(msg.sender)) _;
    }

    function getAllCodes() public view returns (uint64[] memory) {
        return itemCodes;
    }

    function get(uint64 code) public view returns (uint64 , string memory image, string memory title, uint256 price, uint16 quantity, bool available) {
        return (
            code,
            itemsMapping[code].image,
            itemsMapping[code].title,
            itemsMapping[code].price,
            itemsMapping[code].quantity,
            itemsMapping[code].available
        );
    }

    function add(uint64 code, string memory image, string memory title, uint256 price, uint16 quantity, bool available) restricted public payable {
        
        require(code >= 0);
        require(!itemsMapping[code].exist, "item with this code already exists");
        require(keccak256(abi.encode(image)) > 0, "image should not be left empty");
        require(keccak256(abi.encode(title)) > 0, "title should not be left empty");
        require(price >= 0, "price should be 0 or more");
        require(quantity >= 0, "quantity should be 0 or more");

        itemCodes.push(code);
        
        itemsMapping[code].image = image;
        itemsMapping[code].title = title;
        itemsMapping[code].price = price;
        itemsMapping[code].quantity = quantity;
        itemsMapping[code].available = available;
        itemsMapping[code].exist = true;
    }

    function update(uint64 code, string memory image, string memory title, uint256 price, uint16 quantity, bool available) restricted public payable {
        
        require(code >= 0, "code should be greated than 0");
        require(itemsMapping[code].exist, "item with this code should already exist to update");
        require(keccak256(abi.encode(image)) > 0, "image should not be left empty");
        require(keccak256(abi.encode(title)) > 0, "title should not be left empty");
        require(price >= 0, "price should be 0 or more");
        require(quantity >= 0, "quantity should be 0 or more");

        itemsMapping[code].image = image;
        itemsMapping[code].title = title;
        itemsMapping[code].price = price;
        itemsMapping[code].quantity = quantity;

        if(quantity == 0){
            available = false;
        }

        itemsMapping[code].available = available;
    }

    function reduceQuantity(uint64 code, uint16 quantity) public payable {
        require(code >= 0, "code should be greated than 0");
        require(itemsMapping[code].available == true, "item should be available");
        require(itemsMapping[code].exist, "item with this code should already exist to update");
        require(itemsMapping[code].quantity >= quantity, "stock quantity should be more");
        require(quantity >= 0, "quantity should be 0 or more");
        

        withdrawFunds(code, quantity);
        itemsMapping[code].quantity = itemsMapping[code].quantity - quantity;

        if(itemsMapping[code].quantity == 0){
            itemsMapping[code].available = false;
        }
    }

    function withdrawFunds(uint64 code, uint16 quantity) private {
        uint256 outstandingBalance = itemsMapping[code].price * quantity;

        // address payable payableOwner = address(uint160(owner));       

        require(msg.sender.balance >= outstandingBalance, "Not enough balance!");
        require(outstandingBalance == msg.value, "Oustanding balance does not match");

        // payableOwner.transfer(msg.value);
        // payableOwner = msg.sender;

        msg.sender.transfer(msg.value); // transfer funds;
    }

    function() external payable {
        revert();
    }
}