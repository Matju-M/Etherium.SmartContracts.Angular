# Used Patterns 

## Restricting Access

The restricting access pattern is used to restrict access to the owner who deployed the first contract.
This is done by assigning the owner address variable only at deployment, which then calls the constructor.

```
    address owner;

    constructor() public { 
        owner = msg.sender;
    }
```

## Mapping Iterator

The mapping iterator pattern is used to keep track of the stores and store items. Thus the contract user is able to receive an array of all the codes, and decide whether all it items are retreived at once, or just one by one.

```
    uint16[] storeCodes;
    mapping(uint16 => Store) public stores;
```

## Contract Self Destruction 

The contract self destruction pattern is used to transfer funds to the owner instead of getting lost. When a contract gets obsolete, the funds will be transferred instead of lost. 

```
    function destroy() public {
        if(msg.sender == owner){
            selfdestruct(address(uint160(owner)));
        }
    } 
```




# Further Improvements

## Factory Contract pattern 
This implementation might be used to create the store contracts dynamically, thus will have their own funds, instead of having them combined.
