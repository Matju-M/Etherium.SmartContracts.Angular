import _ from 'lodash';
import { Component, OnInit } from '@angular/core';

import storemanager_artifacts from '../../../../build/contracts/StoreManagers.json';
import stores_artifacts from '../../../../build/contracts/Stores.json';
import { Web3Service } from '../../util/web3.service';
import { ProductService } from '../../util/product.service';
import { StoreItem } from '../product-list/product-list.model';
import { Store } from './store-manager.model';

@Component({
    selector: 'app-store-manager',
    templateUrl: './store-manager.component.html',
    styleUrls: ['./store-manager.component.css']
})
export class StoreManagerComponent implements OnInit {

    StoreManagersContract: any;
    StoresContract: any;
    storeManagers: string[];
    currentAccount: string;

    storesList: Store[];

    store: Store = {
        active: true,
        balance: 1,
        code: 1,
        name: 'test'
    };

    storeItem: StoreItem = {
        storeCode: 1,
        code: 1234,
        title: 'test',
        available: false,
        image: 'https://dummyimage.com/100x100/000/fff&text=test',
        price: 1,
        quantity: 1
    };

    constructor(
        private web3Service: Web3Service,
        private productService: ProductService) {
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
                    this.StoresContract = contract;
                    this.getStores();
                }
            );

        this.web3Service.accountsObservable.subscribe((accounts) => {
            this.currentAccount = accounts[0].toLowerCase();
        });

        this.web3Service.detectChanges(async () => {
            const deployed = await this.StoreManagersContract.deployed();
            this.storeManagers = await deployed.getAll();

            this.getStores();
        });
    }

    isStoreSelected(code: number): boolean {
        if (!this.productService.selectedStore.value) {
            return false;
        }

        return code === this.productService.selectedStore.value.code;
    }

    async selectStore(store: Store) {
        this.productService.selectedStore.next(store);
        this.storeItem.storeCode = store.code;
    }

    async getStores() {
        const deployedStores = await this.StoresContract.deployed();
        const storesCode = _.map(await deployedStores.getAllStoreCodes(), x => x.toNumber());

        this.storesList = [];
        _.forEach(storesCode, async code => {
            const [name, active, balance] = await deployedStores.stores(code);

            const convertedBalance = this.web3Service.fromWei('' + balance, 'ether');

            const store = {
                code,
                name,
                balance: +convertedBalance,
                active
            };
            this.storesList.push(store);

        });
    }

    async addStore() {
        const deployed = await this.StoresContract.deployed();
        const { code, name, active, balance } = this.store;
        const convertToWei = this.web3Service.toWei(balance.toString(), 'ether');
        await deployed.add.sendTransaction(+code, name, active, convertToWei, { from: this.currentAccount }).catch(e => console.log(e));
    }

    async updateStore() {
        const deployed = await this.StoresContract.deployed();
        const { code, name, active, balance } = this.store;
        const convertToWei = this.web3Service.toWei(balance.toString(), 'ether');
        await deployed.update(code, name, active, convertToWei, { from: this.currentAccount }).catch(e => console.log(e));
    }

    async addItem() {
        const { storeCode, available, quantity, price, image, code, title } = this.storeItem;
        const deployed = await this.StoresContract.deployed();

        const convertToWei = this.web3Service.toWei(price.toString(), 'ether');

        await deployed.addItem(
            storeCode,
            code,
            image,
            title,
            convertToWei,
            quantity,
            available,
            { from: this.currentAccount }
        ).catch(e => console.log(e));
    }

    async updateItem() {
        const deployed = await this.StoresContract.deployed();
        const { storeCode, available, quantity, price, image, code, title } = this.storeItem;

        const convertToWei = this.web3Service.toWei(price.toString(), 'ether');

        await deployed.updateItem(
            storeCode,
            code,
            image,
            title,
            convertToWei,
            quantity,
            available,
            { from: this.currentAccount }
        ).catch(e => console.log(e));
    }

    trackByCode(_index: number, item: StoreItem): number {
        return item.code;
    }
}

