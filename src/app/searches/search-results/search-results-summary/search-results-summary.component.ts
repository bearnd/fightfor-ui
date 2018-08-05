import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { SearchesService } from '../../../services/searches.service';
import {
  CountByCountryInterface,
  CountByFacilityInterface,
  SearchInterface,
} from '../../../interfaces/search.interface';
import { StudyOverallStatus } from '../../../interfaces/study.interface';
import { MatTableDataSource } from '@angular/material';
import {
  StudyRetrieverService,
} from '../../../services/study-retriever.service';
import {
  StudyStatsRetrieverService,
} from '../../../services/study-stats-retriever.service';


@Component({
  selector: 'app-search-results-summary',
  templateUrl: './search-results-summary.component.html',
  styleUrls: ['./search-results-summary.component.scss']
})
export class SearchResultsSummaryComponent implements OnInit {

  // Number of top locations to display.
  numLocationsDisplay = 5;
  // Location columns to display.
  displayedColumnsLocations = ['rank', 'country', 'countStudies'];
  // Locations table data-source.
  dataSourceLocations: MatTableDataSource<CountByCountryInterface>;

  // Number of top facilities to display.
  numFacilitiesDisplay = 5;
  // Facility columns to display.
  displayedColumnsFacilities = [
    'rank',
    'name',
    'country',
    'city',
    'state',
    'zipCode',
    'countStudies',
  ];
  // Facilities table data-source.
  dataSourceFacilities: MatTableDataSource<CountByFacilityInterface>;

  private loadingSearchStudies = new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByCountry =
    new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByOverallStatus =
    new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByFacility =
    new BehaviorSubject<boolean>(false);

  public isLoadingSearchStudies = this.loadingSearchStudies.asObservable();
  public isLoadingGetCountStudiesByCountry =
    this.loadingGetCountStudiesByCountry.asObservable();
  public isLoadingGetCountStudiesByOverallStatus =
    this.loadingGetCountStudiesByOverallStatus.asObservable();
  public isLoadingGetCountStudiesByFacility =
    this.loadingGetCountStudiesByFacility.asObservable();

  // Index of the navigation pill that's initially active.
  private navPillIndexActive = 0;

  // The search the component will display results for.
  public search: SearchInterface;

  // Create a grouping of overall status values to match the template desing.
  overallStatusGroups = {
    recruiting: [
      'Enrolling by invitation',
      'Recruiting',
      'Available'
    ],
    completed: [
      'Completed',
      'Terminated',
      'Withdrawn',
    ],
    active: [
      'Active, not recruiting',
    ],
    all: Object.values(StudyOverallStatus),
  };

  isSaved = false;
  isEditable = false;

  constructor(
    public searchesService: SearchesService,
    private studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.searchesService.getSearch(searchUuid);

    // Perform the search.
    this.searchesService.searchStudies(searchUuid);

    // Instantiate the data-source for the locations table.
    this.dataSourceLocations = new MatTableDataSource
      <CountByCountryInterface>(
        this.search.studiesStats.byCountry.slice(0, this.numLocationsDisplay)
      );

    // Instantiate the data-source for the facilities table.
    this.dataSourceFacilities = new MatTableDataSource
      <CountByFacilityInterface>(
        this.search.studiesStats.byFacility.slice(0, this.numFacilitiesDisplay)
      );


  }

  toggleSaved() {
    this.isSaved = !this.isSaved;
  }

  toggleEditable() {
    this.isEditable = !this.isEditable;
  }

  /**
   * Checks whether a nav-pill should receive the `active` class depending on
   * the current scroll position relative to the result cards.
   * @param {ScrollTrackerEventData} event The scroll event containing
   * information regarding the current scroll position.
   * @param {number} navPillIndex The index of the nav-pill that triggered this
   * event/function and will be evaluated for 'activation'.
   */
  public onScroll(event: ScrollTrackerEventData, navPillIndex: number) {
    // Retrieve the ratios between the tracked element and the container.
    const ratioTop = event.data.elementTop.fromContainerTop.ratio;
    const ratioBottom = event.data.elementTop.fromContainerTop.ratio;

    // Should the ratios fall within given ranges the tracked element is
    // in view thus we set `navPillIndexActive` to the current pill index.
    if (
      (ratioTop < 0.1 && ratioTop > -0.75) &&
      (ratioBottom < 0.1 && ratioBottom > -1.75)
    ) {
      this.navPillIndexActive = navPillIndex;
    }
  }

  /**
   * Checks whether a nav-pill with a given index is supposed to be active or
   * not.
   * @param {number} navPillIndex The index of the nav-pill to be checked.
   * @returns {boolean} Whether the defined nav-pill is supposed to be active or
   * not.
   */
  public isNavPillActive(navPillIndex: number) {
    // Check whether the defined nav-pill is supposed to be active or not.
    return navPillIndex === this.navPillIndexActive;
  }

  /**
   * Retrieve the count of clinical-trial studies by country for the studies
   * previously attributed to the search. The search is performed via the
   * `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getCountStudiesByCountry(limit?: number) {
    // Indicate that `getCountStudiesByCountry` is ongoing for this search.
    this.loadingGetCountStudiesByCountry.next(true);

    this.studyStatsRetrieverService
      .getCountStudiesByCountry(this.search.studies, limit)
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.byCountry = response;

          // Instantiate the data-source for the locations table.
          this.dataSourceLocations = new MatTableDataSource
            <CountByCountryInterface>(
              this.search.studiesStats.byCountry
            );

          // Indicate that `getCountStudiesByCountry` is complete for this
          // search.
          this.loadingGetCountStudiesByCountry.next(false);
        }
      );
  }
  /**
   * Retrieve the count of clinical-trial studies by facility for the studies
   * previously attributed to a given search. The search is performed via the
   * `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getCountStudiesByFacility(limit?: number) {
    // Indicate that `getCountStudiesByFacility` is ongoing for this search.
    this.loadingGetCountStudiesByFacility.next(true);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByFacility(this.search.studies, limit)
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.byFacility = response;

          // Instantiate the data-source for the facilities table.
          this.dataSourceFacilities = new MatTableDataSource
            <CountByFacilityInterface>(
              this.search.studiesStats.byFacility
            );

          // Indicate that `getCountStudiesByFacility` is complete for this
          // search.
          this.loadingGetCountStudiesByFacility.next(false);
        }
      );
  }

  /**
   * Count the number of studies whose `overallStatus` has one of the values
   * defined under `overallStatusValues`.
   * @param {string[]} overallStatusValues The possible overall status values
   * for which studies will be counted.
   * @returns {number} The number of studies whose overall status matches one of
   * the values under `overallStatusValues`.
   */
  getCountStudiesOverallStatus(
    overallStatusValues: string[],
  ): number {

    // Initialize the count.
    let count = 0;

    // Iterate over the count of studies by overall status and add the number
    // of studies if their overall status is one of those defined under
    // `overallStatusValues`.
    for (const entry of this.search.studiesStats.byOverallStatus) {
      if (overallStatusValues.indexOf(entry.overallStatus) !== -1) {
        count += entry.countStudies;
      }
    }

    return count;
  }

}
