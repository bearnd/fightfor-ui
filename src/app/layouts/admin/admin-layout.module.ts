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

import { ScrollTrackerModule } from '@nicky-lenaers/ngx-scroll-tracker';
import { TruncateModule } from 'ng2-truncate';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxPageScrollModule } from 'ngx-page-scroll';

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
import { FacilitiesComponent } from '../../facilities/facilities.component';
import {
  FacilitiesListComponent
} from '../../facilities/facilities-list/facilities-list.component';
import {
  MeshTermDialogComponent
} from '../../dialogs/mesh-term-dialog/mesh-term-dialog.component';
import {
  MeshTermChipListComponent
} from '../../mesh-term-chip-list/mesh-term-chip-list.component';
import {
  MeshTermChipComponent
} from '../../mesh-term-chip-list/mesh-term-chip.component';
import {
  UserSettingsComponent
} from '../../user-settings/user-settings.component';


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
    ScrollTrackerModule.forRoot(),
    TruncateModule,
    NgxMatSelectSearchModule,
    IonRangeSliderModule,
    NgxPageScrollCoreModule,
    NgxPageScrollModule,
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
    FacilitiesComponent,
    FacilitiesListComponent,
    MeshTermDialogComponent,
    MeshTermChipComponent,
    MeshTermChipListComponent,
    UserSettingsComponent,
  ],
  providers: [],
  entryComponents: [
    MeshTermDialogComponent,
  ],
})

export class AdminLayoutModule {}
