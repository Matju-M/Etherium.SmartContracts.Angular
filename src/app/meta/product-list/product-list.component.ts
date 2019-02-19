
import _ from 'lodash';
import { filter } from 'rxjs/operators';
import { OnInit, Component } from '@angular/core';

import storemanager_artifacts from '../../../../build/contracts/StoreManagers.json';
import stores_artifacts from '../../../../build/contracts/Stores.json';
import { Web3Service } from '../../util/web3.service';
import { StoreItem } from './product-list.model';
import { ProductService } from '../../util/product.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
    StoreManagersContract: any;
    StoreItemsContract: any;
    storeItems: StoreItem[];
    storeManagers: string[];
    currentAccount: string;
    selectedStoreCode: number;

    constructor(
        private web3Service: Web3Service,
        private productService: ProductService
    ) {
    }

    // getter to check if the current account is a store owner. This will be called from
    // the angular component template, and will run every change detected by angular.
    get isStoreOwner() {
        return _.indexOf(this.storeManagers, this.currentAccount) > -1;
    }

    ngOnInit(): void {

        // get the contracts for store manager and store
        this.web3Service.artifactsToContract(storemanager_artifacts)
            .then(
                async contract => {
                    this.StoreManagersContract = contract;
                    const deployed = await this.StoreManagersContract.deployed();
                    this.storeManagers = await deployed.getAll();
                }
            );

        this.web3Service.artifactsToContract(stores_artifacts)
            .then(
                async contract => {
                    this.StoreItemsContract = contract;
                    this.getAllItems();
                }
            );

        /**
         * fires everytime there are changes on the blockchain.
         * It will try to retrieve all the items and store managers.
         */
        this.web3Service.detectChanges(async () => {
            this.getAllItems();
            const deployed = await this.StoreManagersContract.deployed();
            this.storeManagers = await deployed.getAll();
        });

        /**
         * a function that will be called everytime the account has changed.
         * This determines the current account
        */
        this.web3Service.accountsObservable.subscribe((accounts) => {
            this.currentAccount = accounts[0].toLowerCase();
        });

        // a subscription to get the selected store from the service and retrieve all items for that store.
        this.productService.selectedStore.pipe(
            filter(x => !!x)
        ).subscribe(x => {
            this.selectedStoreCode = x.code;
            this.getAllItems();
        });
    }

    async getAllItems() {
        if (!this.selectedStoreCode) {
            return;
        }

        this.storeItems = [];

        const deployed = await this.StoreItemsContract.deployed();

        // get all item codes, this needs to be converted to number
        const itemCodes = _.map(await deployed.getAllItemCodes(this.selectedStoreCode), x => x.toNumber());

        // loop through all the item codes array and retreive the data from the mapping.
        _.forEach(itemCodes, async code => {
            const [image, title, price, quantity, available] = await deployed.storeItems(this.selectedStoreCode, code);

            const item = {
                storeCode: this.selectedStoreCode,
                code,
                title,
                image,
                quantity: quantity.toNumber(),
                price: +this.web3Service.fromWei(price.toString(), 'ether'),
                available
            };

            this.storeItems.push(item);
        });
    }

    // This will convert the price from ether to wei, and sends a buy item request
    async buyItem(code: number, price: number) {
        const deployed = await this.StoreItemsContract.deployed();
        const convertToWei = this.web3Service.toWei(price.toString(), 'ether');
        await deployed.buyItem(this.selectedStoreCode, code, 1, { from: this.currentAccount, value: convertToWei, gas: 50000 });
    }
}
