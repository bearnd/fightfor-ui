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
  MatIconModule,
  MatAutocompleteModule,
} from '@angular/material';

import { Ng2PageScrollModule, PageScrollService} from 'ng2-page-scroll';
import { ScrollTrackerModule } from '@nicky-lenaers/ngx-scroll-tracker';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { SearchesComponent } from '../../searches/searches.component';
import { SearchResultsComponent } from '../../searches/search-results/search-results.component';
import { SearchNewComponent } from '../../searches/search-new/search-new.component';
import { SearchesGridComponent } from '../../searches/searches-grid/searches-grid.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    Ng2PageScrollModule,
    ScrollTrackerModule.forRoot(),
  ],
  declarations: [
    DashboardComponent,
    SearchesComponent,
    SearchResultsComponent,
    SearchNewComponent,
    SearchesGridComponent,
  ],
  providers: [PageScrollService]
})

export class AdminLayoutModule {}
