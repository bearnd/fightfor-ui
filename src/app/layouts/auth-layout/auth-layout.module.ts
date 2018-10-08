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
} from '@angular/material';

import { HomeComponent } from '../../home/home.component';
import { AuthLayoutRoutes } from './auth-layout.routing';

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
  ],
  declarations: [
    HomeComponent
  ],
  providers: [],
  entryComponents: [],
})

export class AuthLayoutModule {}
