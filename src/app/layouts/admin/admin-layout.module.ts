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
  MatTableModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSortModule,
  MatSelectModule,
  MatRadioModule,
  MatDialogModule,
  MatExpansionModule,
} from '@angular/material';

import { Ng2PageScrollModule, PageScrollService} from 'ng2-page-scroll';
import { ScrollTrackerModule } from '@nicky-lenaers/ngx-scroll-tracker';
import { TruncateModule } from 'ng2-truncate';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { SearchesComponent } from '../../searches/searches.component';
import {
  SearchResultsComponent
} from '../../searches/search-results/search-results.component';
import {
  SearchNewComponent
} from '../../searches/search-new/search-new.component';
import {
  SearchesGridComponent
} from '../../searches/searches-grid/searches-grid.component';
import {
  SearchResultsSummaryComponent
} from '../../searches/search-results/search-results-summary/search-results-summary.component';
import {
  StudiesListComponent
} from '../../studies/studies-list/studies-list.component';
import { StudyComponent } from '../../studies/study/study.component';
import { StudiesComponent } from '../../studies/studies.component';


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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatRadioModule,
    MatDialogModule,
    MatExpansionModule,
    Ng2PageScrollModule,
    ScrollTrackerModule.forRoot(),
    TruncateModule,
    NgxMatSelectSearchModule,
    IonRangeSliderModule,
  ],
  declarations: [
    SearchesComponent,
    SearchResultsComponent,
    SearchResultsSummaryComponent,
    SearchNewComponent,
    SearchesGridComponent,
    StudiesListComponent,
    StudiesComponent,
    StudyComponent,
  ],
  providers: [PageScrollService],
})

export class AdminLayoutModule {}
