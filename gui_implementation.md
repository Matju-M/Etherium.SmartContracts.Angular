# GUI Implementation

## Technology

The technology is implemented using truffle, angular and webpack. Truffle provides an easy service called web3, to communicate with the blockchain and the contracts in a very easy way. Angular and webpack on the other hand handle the front end website interface.

## Angular 

### Components

The current solution has 3 components: Product-List, Store-Admin and Store-Manager. They are in src/app/meta

The product-list component is responsible to show the products and an option to buy if the user is a shopper.

The store-admin component is responsible to provide the funtionality to add store managers.

The store-manager component is responsible to provide the functionality to add new stores and new items, while managing them.

### Services

There are two angular service under src/utils. These are product.service and web3.service.

Product service servces as a singleton service to be able to pass around the information of the selected store and store item around the components without introducint, pubsubs, two-way bindings between components or redux, which will complicate the application unnecessarily.

The web3.service is a service wrapper around the web3 provided by truffle. It has some minor wrapper classes such as to convert to and from wei.
