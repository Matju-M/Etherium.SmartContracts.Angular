import { Injectable } from '@angular/core';
import contract from 'truffle-contract';
import { Subject } from 'rxjs';

import Web3 from 'web3';
import { Unit } from 'web3/utils';

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public ready = false;
  public MetaCoin: any;
  public accountsObservable = new Subject<string[]>();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    setInterval(() => this.refreshAccounts(), 100);
  }

  // returns the web3 provider
  public getWeb3Provider(): Web3 {
    return this.web3;
  }

  // util function to handle conversion from ascii to hex.
  public toAscii(hex: string): string {
    return this.getWeb3Provider().utils.toAscii(hex);
  }

  // util function to convert any ether unit to wei
  public toWei(value: string, unit: Unit): string {
    return this.getWeb3Provider().utils.toWei(value, unit);
  }

  // util function to convert from wei to a ether unit
  public fromWei(value: string, unit: Unit) {
    return this.getWeb3Provider().utils.fromWei(value, unit);
  }

  // function to get the contract from the json artifact
  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  // a promise that will callback every time there are changes to the blockchain
  public async detectChanges(callback: Function) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.detectChanges(callback);
    }

    return this.web3.eth.subscribe('newBlockHeaders', callback);
  }

  // a function to refresh and return new accounts.
  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
