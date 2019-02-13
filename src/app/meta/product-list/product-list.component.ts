
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

    get isStoreOwner() {
        return _.indexOf(this.storeManagers, this.currentAccount) > -1;
    }

    ngOnInit(): void {

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

        this.web3Service.detectChanges(async () => {
            this.getAllItems();
            const deployed = await this.StoreManagersContract.deployed();
            this.storeManagers = await deployed.getAll();
        });

        this.web3Service.accountsObservable.subscribe((accounts) => {
            this.currentAccount = accounts[0].toLowerCase();
        });

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
        const itemCodes = _.map(await deployed.getAllItemCodes(1), x => x.toNumber());

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

    async buyItem(code: number, price: number) {
        const deployed = await this.StoreItemsContract.deployed();
        const convertToWei = this.web3Service.toWei(price.toString(), 'ether');
        await deployed.buyItem(this.selectedStoreCode, code, 1, { from: this.currentAccount, value: convertToWei, gas: 50000 });
    }
}
