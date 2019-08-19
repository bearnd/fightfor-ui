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
  MatExpansionModule,
} from '@angular/material';

import { NgxBraintreeModule } from 'ngx-braintree';

import { HomeComponent } from '../../home/home.component';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { CallbackComponent } from '../../callback/callback.component';
import { PricingComponent } from '../../pricing/pricing.component';
import { FaqComponent } from '../../faq/faq.component';
import { RoadmapComponent } from '../../roadmap/roadmap.component';

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
    MatExpansionModule,
  ],
  declarations: [
    HomeComponent,
    CallbackComponent,
    PricingComponent,
    FaqComponent,
    RoadmapComponent,
  ],
  providers: [],
  entryComponents: [],
})

export class AuthLayoutModule {}
