import * as _ from "lodash";
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { Web3Service } from '../../util/web3.service';

declare let require: any;
const metacoin_artifacts = require('../../../../build/contracts/MetaCoin.json');
const storemanager_artifacts = require('../../../../build/contracts/StoreManagers.json');

@Component({
  selector: 'app-meta-sender',
  templateUrl: './meta-sender.component.html',
  styleUrls: ['./meta-sender.component.css']
})
export class MetaSenderComponent implements OnInit {
  accounts: string[];
  MetaCoin: any;
  StoreManagersContract: any;

  isAdmin: boolean;

  storeManagerAddress: string;
  storeManagers: string[];

  model = {
    amount: 5,
    receiver: '',
    balance: 0,
    account: ''
  };

  status = '';

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {

    console.log('OnInit: ' + this.web3Service);

    console.log(this);

    this.watchAccount();

    this.web3Service.artifactsToContract(metacoin_artifacts)
      .then((MetaCoinAbstraction) => {
        this.MetaCoin = MetaCoinAbstraction;
        this.MetaCoin.deployed().then(deployed => {
          console.log(deployed);
          deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
            this.refreshBalance();
          });
        });

      });


    this.web3Service.artifactsToContract(storemanager_artifacts)
      .then(
        async contract => {
          this.StoreManagersContract = contract;
        }
      );
    this.checkForOwner();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;

      this.model.account = accounts[0];
      this.refreshBalance();
      this.checkForOwner();
    });
  }

  async checkForOwner() {
    if (!this.StoreManagersContract) {
      return;
    }
    const deployed = await this.StoreManagersContract.deployed();
    this.isAdmin = await deployed.amITheOwner({ from: this.model.account });
    this.storeManagers = await deployed.getAll();
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 3000 });
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
    this.storeManagers = await deployed.add(this.storeManagerAddress, { from: this.model.account });
  }

  async removeManager() {
    const index = _.indexOf(this.storeManagers, this.storeManagerAddress);

    const deployed = await this.StoreManagersContract.deployed();
    if (index > -1) {
      this.storeManagers = await deployed.remove(index, { from: this.model.account });
    } else {
      console.log('No storemanager with the address found');
    }
  }

  async sendCoin() {
    if (!this.MetaCoin) {
      this.setStatus('Metacoin is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const receiver = this.model.receiver;

    console.log('Sending coins' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedMetaCoin = await this.MetaCoin.deployed();
      const transaction = await deployedMetaCoin.sendCoin.sendTransaction(receiver, amount, { from: this.model.account });

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async refreshBalance() {
    console.log('Refreshing balance');

    try {
      const deployedMetaCoin = await this.MetaCoin.deployed();
      console.log(deployedMetaCoin);
      console.log('Account', this.model.account);
      const metaCoinBalance = await deployedMetaCoin.getBalance.call(this.model.account);
      console.log('Found balance: ' + metaCoinBalance);
      this.model.balance = metaCoinBalance;
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting balance; see log.');
    }
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.model.receiver = e.target.value;
  }

  trackBy(_index: number, id: number): number {
    return id;
  }

}
