# Avoiding Common Attacks

## ReEntrancy

In buyItem function (stores smart contract), it was decided to take the funds before decreasing the quantity. If it was the other way round, we'll be reducing the quantity before actually taken all the money.

## Contract Ownership

For every contract there is an owner for administrative privileges.

## Functions and Data Structure Exposure

For every function and data structure, the permission level are set (private, public, external);

## Loops

Loops inside a contracts where limited to removal of store managers only. Since it was not predicted that many store managers will be added/removed. For stores and store items, a mapping was used instead of an array, and iteration for the mapping was done by the frontend application since this can be a very large loop causing issues with gas.

## Sanitization of arguments

For every function there are checks that determine whether the data received is within range. All checks are with require, so the call is then reverted with the error.

