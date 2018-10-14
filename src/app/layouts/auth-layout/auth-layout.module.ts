import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatTooltipModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatIconModule,
} from '@angular/material';

import { NgxBraintreeModule } from 'ngx-braintree';

import { HomeComponent } from '../../home/home.component';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { CallbackComponent } from '../../callback/callback.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NgxBraintreeModule,
  ],
  declarations: [
    HomeComponent,
    CallbackComponent,
  ],
  providers: [],
  entryComponents: [],
})

export class AuthLayoutModule {}
