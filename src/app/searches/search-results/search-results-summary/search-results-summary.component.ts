import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatTableDataSource } from '@angular/material';

import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/finally';
import swal from 'sweetalert2';
import * as moment from 'moment';
import * as Datamap from 'datamaps/dist/datamaps.world.min.js';
import * as d3 from 'd3';

import {
  LatestDescriptorInterface,
  SearchInterface,
  StudiesCountByCountryInterface,
  StudiesCountByDescriptorInterface,
  StudiesCountByFacilityInterface,
} from '../../../interfaces/user-config.interface';
import {
  MeshTermType,
  StudyInterface,
  StudyOverallStatus
} from '../../../interfaces/study.interface';
import {
  StudyRetrieverService
} from '../../../services/study-retriever.service';
import {
  StudyStatsRetrieverService
} from '../../../services/study-stats-retriever.service';
import { overallStatusGroups } from '../../../shared/common.interface';
import { getCountryCode } from '../../../shared/countries';
import { UserConfigService } from '../../../services/user-config.service';
import { DescriptorInterface } from '../../../interfaces/descriptor.interface';


@Component({
  selector: 'app-search-results-summary',
  templateUrl: './search-results-summary.component.html',
  styleUrls: ['./search-results-summary.component.scss']
})
export class SearchResultsSummaryComponent implements OnInit {

  @ViewChild('worldMap') elementWorldMap: ElementRef;
  @ViewChild('paginatorStudiesLocation') paginator: MatPaginator;

  public worldMapHeight: number;
  public worldMapWidth: number;

  // Number of top studies locations to display.
  numStudiesLocationsDisplay = 5;
  // Studies location columns to display.
  displayedColumnsStudiesLocations = ['rank', 'country', 'countStudies'];
  // Studies locations table data-source.
  dataSourceStudiesLocations:
    MatTableDataSource<StudiesCountByCountryInterface>;

  // Number of top facilities to display.
  numFacilitiesDisplay = 5;
  // Facility columns to display.
  displayedColumnsFacilities = [
    'rank',
    'name',
    'country',
    'locality',
    // 'administrativeAreaLevel1',  // TODO: re-evaluate whether to remove
    'topInterventions',
    'countStudies',
  ];
  // Facilities table data-source.
  dataSourceFacilities: MatTableDataSource<StudiesCountByFacilityInterface>;
  // The top MeSH intervention descriptors by facility.
  public topFacilityMeshTerms: {[key: string]: DescriptorInterface[]} = {};

  // Number of top intervention descriptors to display.
  numInterventionDescriptorsDisplay = 5;
  // Intervention descriptors columns to display.
  displayedColumnsInterventionDescriptors = [
    'rank',
    'name',
    'countStudies',
  ];
  // Intervention descriptors table data-source.
  dataSourceInterventionDescriptors:
    MatTableDataSource<StudiesCountByDescriptorInterface>;

  // Number of latest intervention descriptors to display.
  numLatestDescriptorsDisplay = 5;
  // Latest descriptors columns to display.
  displayedColumnsLatestDescriptors = [
    'rank',
    'name',
    'date',
  ];
  // Latest descriptors table data-source.
  dataSourceLatestDescriptors:
    MatTableDataSource<LatestDescriptorInterface>;

  private loadingSearchStudies = new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByCountry =
    new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByOverallStatus =
    new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByFacility =
    new BehaviorSubject<boolean>(false);
  private loadingGetCountStudiesByDescriptor =
    new BehaviorSubject<boolean>(false);
  private loadingGetLatestDescriptors =
    new BehaviorSubject<boolean>(false);

  public isLoadingSearchStudies = this.loadingSearchStudies.asObservable();
  public isLoadingGetCountStudiesByCountry =
    this.loadingGetCountStudiesByCountry.asObservable();
  public isLoadingGetCountStudiesByOverallStatus =
    this.loadingGetCountStudiesByOverallStatus.asObservable();
  public isLoadingGetCountStudiesByFacility =
    this.loadingGetCountStudiesByFacility.asObservable();
  public isLoadingGetCountStudiesByDescriptor =
    this.loadingGetCountStudiesByDescriptor.asObservable();
  public isLoadingGetLatestDescriptors =
    this.loadingGetLatestDescriptors.asObservable();

  // Index of the navigation pill that's initially active.
  private navPillIndexActive = 0;

  // The search the component will display results for.
  public search: SearchInterface;

  // Placeholder for the count of studies by overall-status group.
  countStudiesByOverallStatusGroup = {
    recruiting: null,
    completed: null,
    active: null,
    all: null,
  };

  worldMap: Datamap = null;

  constructor(
    public userConfigService: UserConfigService,
    public studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.userConfigService.getUserSearch(searchUuid);

    // Perform the search.
    this.performSearch();
  }

  /**
   * Trigger when resizing and re-calculate the map dimensions.
   * @param event The resizing event.
   */
  onResize(event: Event) {
    if (this.elementWorldMap) {
      this.worldMapHeight = this.elementWorldMap.nativeElement.clientHeight;
      this.worldMapWidth = this.elementWorldMap.nativeElement.clientWidth;
      if (this.worldMap) {
        this.worldMap.resize();
      }
    }
  }

  /**
   * Checks whether a nav-pill should receive the `active` class depending on
   * the current scroll position relative to the result cards.
   * @param event The scroll event containing information regarding the current
   * scroll position.
   * @param navPillIndex The index of the nav-pill that triggered this
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
   * @param navPillIndex The index of the nav-pill to be checked.
   * @returns Whether the defined nav-pill is supposed to be active or not.
   */
  public isNavPillActive(navPillIndex: number) {
    // Check whether the defined nav-pill is supposed to be active or not.
    return navPillIndex === this.navPillIndexActive;
  }

  /**
   * Perform the defined search by retrieving the clinical-trial studies
   * corresponding to the selected descriptors of the search. The search is
   * performed via the `StudyRetrieverService`.
   */
  performSearch() {

    // Indicate that `searchStudies` is ongoing for this search.
    this.loadingSearchStudies.next(true);

    // Perform the search retrieving the clinical-trial studies and setting
    // them under the search object.
    this.studyRetrieverService
      .searchStudies(
        this.search.descriptors,
        this.search.gender || null,
        this.search.yearBeg || null,
        this.search.yearEnd || null,
        this.search.ageBeg || null,
        this.search.ageEnd || null,
      )
      .subscribe(
        (studies: StudyInterface[]) => {

          // If no studies were found for the given search show an alert
          // precluding the user from dismissing the alert and redirecting then
          // to the new-search screen if they press OK.
          if (!studies.length) {
            swal({
              title: 'No results found!',
              text: 'No trials were found for your selected parameters. ' +
                    'Please try a different search',
              footer: '<p>Email <a href="mailto:support' +
                      '@bearnd.io">support@bearnd.io</a></p>',
              showCancelButton: false,
              showConfirmButton: true,
              buttonsStyling: false,
              confirmButtonClass: 'btn btn-rose',
              confirmButtonText: 'OK',
              type: 'warning',
              allowOutsideClick: false,
            }).then(result => {
              if (result.value) {
                const res = this.router.navigate(
                  ['/app', 'searches', 'new'],
                );
                res.then();
              }
            }).catch(swal.noop);
          } else {
            // Assign the retrieved studies to the search.
            this.search.studies = studies;

            // Trigger an update the study-statistics via the corresponding
            // methods.
            this.getCountStudiesByOverallStatus();
            this.getCountStudiesByCountry();
            this.getCountStudiesByFacility(this.numFacilitiesDisplay);
            this.getCountStudiesByDescriptor(
              this.numInterventionDescriptorsDisplay,
            );
            this.getLatestDescriptors(this.numLatestDescriptorsDisplay);
          }

          // Indicate that `searchStudies` is complete for this search.
          this.loadingSearchStudies.next(false);
        }
      );
  }

  /**
   * Retrieve the count of clinical-trial studies by country for the studies
   * previously attributed to the search. The search is performed via the
   * `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getCountStudiesByCountry() {
    // Indicate that `getCountStudiesByCountry` is ongoing for this search.
    this.loadingGetCountStudiesByCountry.next(true);

    this.studyStatsRetrieverService
      .getCountStudiesByCountry(this.search.studies)
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.byCountry = response;

          // Instantiate the data-source for the locations table.
          this.dataSourceStudiesLocations = new MatTableDataSource
            <StudiesCountByCountryInterface>(
              this.search.studiesStats.byCountry
            );
          this.dataSourceStudiesLocations.paginator = this.paginator;

          this.configureStudiesLocationsMap(response);

          // Indicate that `getCountStudiesByCountry` is complete for this
          // search.
          this.loadingGetCountStudiesByCountry.next(false);
        }
      );
  }

  /**
   * Retrieve the count of clinical-trial studies by overall status for the
   * studies previously attributed to the search. The search is performed
   * via the `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getCountStudiesByOverallStatus() {
    // Indicate that `getCountStudiesByOverallStatus` is ongoing for this
    // search.
    this.loadingGetCountStudiesByOverallStatus.next(true);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByOverallStatus(this.search.studies)
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.byOverallStatus = response;

          // Calculate the number of studies by grouped overall status so they
          // can be rendered in the template.
          this.countStudiesByOverallStatusGroup.recruiting =
            this.getCountStudiesOverallStatus(
              overallStatusGroups.recruiting,
            );

          this.countStudiesByOverallStatusGroup.active =
            this.getCountStudiesOverallStatus(
              overallStatusGroups.active,
            );

          this.countStudiesByOverallStatusGroup.completed =
            this.getCountStudiesOverallStatus(
              overallStatusGroups.completed,
            );

          this.countStudiesByOverallStatusGroup.all =
            this.getCountStudiesOverallStatus(
              overallStatusGroups.all,
            );

          // Indicate that `getCountStudiesByOverallStatus` is complete for
          // this search.
          this.loadingGetCountStudiesByOverallStatus.next(false);
        }
      );
  }

  /**
   * Retrieve the count of clinical-trial studies by facility for the studies
   * previously attributed to a given search. The search is performed via the
   * `StudyStatsRetrieverService`. Once this query is performed the top MeSH
   * descriptors denoting interventions are retrieved per facility again
   * through `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getCountStudiesByFacility(limit?: number) {
    // Indicate that `getCountStudiesByFacility` is ongoing for this search.
    this.loadingGetCountStudiesByFacility.next(true);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByFacility(
        this.search.studies,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        limit,
        null,
      )
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.byFacility = response;

          // Iterate over the aggregation results and retrieve the top 3
          // intervention MeSH descriptors per facility.
          for (const result of response) {
            this.studyStatsRetrieverService
            .getCountStudiesByFacilityDescriptor(
              this.search.studies,
              [result.facilityCanonical.facilityCanonicalId],
              MeshTermType.INTERVENTION,
              3
            ).subscribe(
              (response_sub) => {
                this.topFacilityMeshTerms[
                  result.facilityCanonical.facilityCanonicalId
                  ] = response_sub.map(
                  function (entry) {
                    return entry.meshTerm;
                  }
                );
              }
            );
          }

          // Instantiate the data-source for the facilities table.
          this.dataSourceFacilities = new MatTableDataSource
            <StudiesCountByFacilityInterface>(
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
   * @param overallStatusMembers The possible overall status values for which
   * studies will be counted.
   * @returns The number of studies whose overall status matches one of the
   * values under `overallStatusValues`.
   */
  getCountStudiesOverallStatus(
    overallStatusMembers: StudyOverallStatus[],
  ): number {

    // Initialize the count.
    let count = 0;

    // Create an array of the defined overallStatus members.
    const overallStatusValues = overallStatusMembers.map(
      (member) => member.valueOf()
    );

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

  /**
   * Retrieve the count of clinical-trial studies by MeSH desriptor for the
   * studies previously attributed to a given search. The search is performed
   * via the `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getCountStudiesByDescriptor(limit?: number) {
    // Indicate that `getCountStudiesByDescriptor` is ongoing for this search.
    this.loadingGetCountStudiesByDescriptor.next(true);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByDescriptor(
        this.search.studies,
        MeshTermType.INTERVENTION,
        limit,
      )
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.byDescriptor = response;

          // Instantiate the data-source for the studies-by-descriptors table.
          this.dataSourceInterventionDescriptors = new MatTableDataSource
            <StudiesCountByDescriptorInterface>(
              this.search.studiesStats.byDescriptor
            );

          // Indicate that `getCountStudiesByDescriptor` is complete for this
          // search.
          this.loadingGetCountStudiesByDescriptor.next(false);
        }
      );
  }

  /**
   * Retrieve the latest MeSH descriptors for the studies previously attributed
   * to a given search. The search is performed via the
   * `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   */
  getLatestDescriptors(limit?: number) {
    // Indicate that `getLatestDescriptors` is ongoing for this search.
    this.loadingGetLatestDescriptors.next(true);

    // Perform the search.
    this.studyStatsRetrieverService
      .getLatestDescriptors(
        this.search.studies,
        MeshTermType.INTERVENTION,
        limit,
      )
      .subscribe(
        (response) => {
          // Assign the retrieved stats to the search.
          this.search.studiesStats.latestDescriptors = response;

          // Instantiate the data-source for the latest-descriptors table.
          this.dataSourceLatestDescriptors = new MatTableDataSource
            <LatestDescriptorInterface>(
              this.search.studiesStats.latestDescriptors
            );

          // Indicate that `getLatestDescriptors` is complete for this
          // search.
          this.loadingGetLatestDescriptors.next(false);
        }
      );
  }

  /**
   * Navigate to the `StudiesListComponent` passing the search UUID and
   * overall-status group to be used in filtering studies.
   * @param searchUuid The search UUID for which to display studies.
   * @param overallStatusGroupName The group of overall-statuses to filter the
   * studies by.
   */
  onNavigateToList(searchUuid: string, overallStatusGroupName: string) {

    const result = this.router.navigate(
      [
        '/app',
        'searches',
        searchUuid,
        'trials',
        overallStatusGroupName,
      ],
    );
    result.then();
  }

  /**
   * Navigate to the `FacilitiesListComponent` passing the search UUID to be
   * used in filtering facilities.
   * @param searchUuid The search UUID for which to display studies.
   */
  onNavigateToFacilitiesList(searchUuid: string) {

    const result = this.router.navigate(
      [
        '/app',
        'searches',
        searchUuid,
        'institutions',
      ],
    );
    result.then();
  }


  /**
   * Configures and initializes the studies locations map based on the results
   * of the studies-by-country aggregation.
   * @param studiesByCountry The results of the studies-by-country aggregation.
   */
  configureStudiesLocationsMap(
    studiesByCountry: StudiesCountByCountryInterface[],
  ) {

    // Return if no studies-by-country were found.
    if (!studiesByCountry[0]) {
      return;
    }

    // Calculate the maximum and minimum values of study-count.
    const mapMax: number = studiesByCountry
      .reduce(
        (max, entry) => entry.countStudies > max ? entry.countStudies : max,
        studiesByCountry[0].countStudies
      );
    const mapMin: number = studiesByCountry
      .reduce(
        (min, entry) => entry.countStudies < min ? entry.countStudies : min,
        studiesByCountry[0].countStudies
      );

    // Populate two objects with the number of studies by countries and the
    // color to be used by country based on that country's number of studies.
    const data = {};
    const fills = {
      defaultFill: '#eee'
    };
    for (const entry of studiesByCountry) {
      const code = getCountryCode(entry.country);
      if (code) {
        // Calculate the fill-color value based on the number of studies making
        // the minimum opacity 50%.
        const alphaValue = (entry.countStudies - mapMin) / mapMax + 0.50;
        // Populate objects.
        data[code] = {numTrials: entry.countStudies, fillKey: code};
        fills[code] = 'rgba(246, 92, 80,' + alphaValue + ' )';
      }
    }

    // Instantiate the map.
    this.worldMap = new Datamap({
      element: document.getElementById('worldMap'),
      scope: 'world',
      projection: 'mercator',
      setProjection: (element) => {
        const projection = d3.geo.mercator()
          .center([0, 40])
          .rotate([0, 0, 0])
          .scale(60)
          .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
        const path = d3.geo.path()
          .projection(projection);

        return {path: path, projection: projection};
      },
      height: this.worldMapHeight,
      width: this.worldMapWidth,
      responsive: true,
      geographyConfig: {
        popupOnHover: true,
        highlightOnHover: true,
        borderColor: '#444',
        borderWidth: 0.5,
        popupTemplate: (geo, countryData) => {
          return ['<div class="hoverinfo"><strong>',
            'Number of trials in ' + geo.properties.name,
            ': ' + countryData.numTrials,
            '</strong></div>'].join('');
        }
      },
      fills: fills,
      data: data,
    });
  }

  /**
   * Converts a date to a humanized version of the duration between the current
   * date and the provided one.
   *
   * It is assumed that `date` is a past date.
   *
   * @param date The past date for which the humanized duration will be created.
   * @returns The humanized duration.
   */
  humanizeDate(date: Date): string {
    return moment.duration(moment().diff(date)).humanize();
  }

  /**
   * Navigates to the `StudiesListComponent` with a predefined country so that
   * only studies for the given country are shown.
   * @param country The facility for which to navigate.
   */
  onNavigateToCountry(country: string) {

    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];

    const result = this.router.navigate(
      [
        '/app',
        'searches',
        searchUuid,
        'trials',
        'all',
      ],
      {state: {country: country}}
    );
    result.then();
  }
}
