# Used Patterns 

## Restricting Access Pattern

The restricting access pattern is used to restrict access to the owner who deployed the first contract.
This is done by assigning the owner address variable only at deployment, which then calls the constructor.

## Mapping Iterator Pattern

The mapping iterator pattern is used to keep track of the stores and store items. Thus the contract user is able to receive an array of all the codes, and decide whether all it items are retreived at once, or just one by one.

# Further Improvements

## Factory Contract pattern 
This implementation could be used to create the store contracts dynamically.
