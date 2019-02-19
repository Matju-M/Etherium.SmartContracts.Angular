import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Store } from '../meta/store-manager/store-manager.model';
import { StoreItem } from '../meta/product-list/product-list.model';

/**
 *  This service is used to as a singleton service to pass data across components
 *  and hence can check for the current selected store and selected product if required.
 */

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    selectedStore: BehaviorSubject<Store> = new BehaviorSubject(undefined);
    selectedProduct: BehaviorSubject<StoreItem> = new BehaviorSubject(undefined);

}
