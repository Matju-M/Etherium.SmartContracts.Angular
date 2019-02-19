# Online MarketPlace

This solution creates an online marketplace that operates on the etherium blockchain. An administrator (the user the deployed the smart contract)
is able to add store owners. These store owners in turn can add new stores, while also create products in those stores.
Shoppers then can visit the stores and purchase goods.


Frontend application is based on [angular-truffle-box](https://truffleframework.com/boxes/angular-truffle-box)

Links to Documentation:

[Design Patterns](design_pattern_desicions.md)

[Avoiding Common Attacks](avoiding_common_attacks.md)


# Setup

## Step 1

Install [Metamask](https://metamask.io/) on chrome or firefox from 

## Step 2

Open command prompt or bash. Then globally install angular, truffle and ganache.

```
npm install -g  @angular-cli truffle ganache-cli
```

## Step 3
Run Ganache-cli

Seed 0 is used to that everytime ganache is restarted, the test accounts generated will be the same.

```
ganache-cli --seed 0 
```

## Step 4

Use metamask to import three selected accounts. They will be the admin, storemanager and just a normal user.

## Step 5

Change directory to the current project in command prompt or bash. Then compile and migrate the smart contracts.

```
truffle compile && truffle migrate
```

# Running The application

Run the application, it will be served on http://localhost:4200
```
npm start
```

# Testing

To run the truffle tests (make sure truffle is >= 5.0.4 for windows).

```
truffle test
```

