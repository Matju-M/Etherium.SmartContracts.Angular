import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtilModule } from '../util/util.module';
import { RouterModule } from '@angular/router';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatOptionModule,
  MatSelectModule,
  MatSnackBarModule,
  MatListModule,
  MatGridListModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { StoreAdminComponent } from './store-admin/store-admin.component';
import { ProductListComponent } from './product-list/product-list.component';
import { StoreManagerComponent } from './store-manager/store-manager.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatOptionModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterModule,
    UtilModule,
    MatListModule,
    MatGridListModule,
    FormsModule
  ],
  declarations: [
    StoreAdminComponent,
    ProductListComponent,
    StoreManagerComponent
  ],
  exports: [
    StoreAdminComponent,
    ProductListComponent,
    StoreManagerComponent
  ]
})
export class MetaModule {
}
