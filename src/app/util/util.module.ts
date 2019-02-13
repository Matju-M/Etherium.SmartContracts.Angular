import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Web3Service} from './web3.service';
import { ProductService } from '../util/product.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    Web3Service,
    ProductService
  ],
  declarations: []
})
export class UtilModule {
}
