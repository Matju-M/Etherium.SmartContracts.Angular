
import _ from 'lodash';
import { OnInit, Component } from '@angular/core';

import storemanager_artifacts from '../../../../build/contracts/StoreManagers.json';

import { Web3Service } from '../../util/web3.service';

@Component({
  selector: 'app-store-admin',
  templateUrl: './store-admin.component.html',
  styleUrls: ['./store-admin.component.css']
})
export class StoreAdminComponent implements OnInit {

  StoreManagersContract: any;

  isAdmin: boolean;
  storeManagerAddress: string;
  storeManagers: string[];
  currentAccount: string;

  constructor(private web3Service: Web3Service) {
  }

  ngOnInit(): void {

    this.web3Service.artifactsToContract(storemanager_artifacts)
      .then(
        async contract => {
          this.StoreManagersContract = contract;
          const deployed = await this.StoreManagersContract.deployed();
          this.storeManagers = await deployed.getAll();
          this.checkForOwner();
        }
      );

    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.currentAccount = accounts[0].toLowerCase();
      this.checkForOwner();
    });
  }

  async checkForOwner() {
    if (!this.StoreManagersContract) {
      return;
    }

    const deployed = await this.StoreManagersContract.deployed();
    this.isAdmin = await deployed.isOwner({ from: this.currentAccount });

    this.web3Service.detectChanges(async () => {
      this.storeManagers = await deployed.getAll();
    });
  }

  async reloadManagers() {
    const deployed = await this.StoreManagersContract.deployed();
    this.storeManagers = await deployed.getAll();
  }

  async addManager() {
    if (_.indexOf(this.storeManagers, this.storeManagerAddress) > -1) {
      return;
    }

    const deployed = await this.StoreManagersContract.deployed();
    await deployed.add.sendTransaction(this.storeManagerAddress, { from: this.currentAccount })
      .catch(e => console.log(e));
  }

  async removeManager() {
    const index = _.indexOf(this.storeManagers, this.storeManagerAddress);
    const deployed = await this.StoreManagersContract.deployed();

    if (index > -1) {
      await deployed.remove.sendTransaction(index, { from: this.currentAccount })
        .catch(e => console.log(e));
    } else {
      console.log('No storemanager with the address found');
    }
  }

  trackById(_index: number, id: string): string {
    return id;
  }

}
