import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { SearchesComponent } from '../../searches/searches.component';

import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatTooltipModule,
  MatChipsModule,
} from '@angular/material';

import { SearchResultsComponent } from '../../searches/search-results/search-results.component';
import { SearchNewComponent } from '../../searches/search-new/search-new.component';
import { SearchesGridComponent } from '../../searches/searches-grid/searches-grid.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    SearchesComponent,
    SearchResultsComponent,
    SearchNewComponent,
    SearchesGridComponent
  ],
})

export class AdminLayoutModule {}
