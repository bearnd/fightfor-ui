import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatPaginator, MatSelect, MatSort, MatTable, } from '@angular/material';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { debounceTime, merge, take, takeUntil, tap } from 'rxjs/operators';
import 'rxjs/add/operator/map';

import { GeolocationService, MapBoxFeature, MapBoxGeocodeResponse } from '../../services/geolocation.service';
import { FacilitiesDatasource } from './facilities.datasource';
import { FacilityCanonicalInterface, MeshTermType, OrderType, StudyInterface, StudyOverallStatus } from '../../interfaces/study.interface';
import { AuthService } from '../../services/auth.service';
import { UserConfigService } from '../../services/user-config.service';
import { StudyRetrieverService } from '../../services/study-retriever.service';
import { StudyStatsRetrieverService } from '../../services/study-stats-retriever.service';
import { SearchInterface, StudiesCountByCountryInterface, StudiesCountByFacilityInterface } from '../../interfaces/user-config.interface';
import { overallStatusGroups } from '../../shared/common.interface';
import { DescriptorInterface } from '../../interfaces/descriptor.interface';
import { orderObjectArray, orderStringArray } from '../../shared/utils';


interface EnumInterface {
  id: string;
  name: string;
}

interface StudyLocationInterface {
  id: number;
  name: string;
}

interface UniqueDescriptor {
  id: number;
  name: string;
  descriptor: DescriptorInterface;
}


@Component({
  selector: 'app-facilities-list',
  templateUrl: './facilities-list.component.html',
  styleUrls: ['./facilities-list.component.scss'],
})
export class FacilitiesListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('selectIntervention') selectIntervention: MatSelect;
  @ViewChild('selectCondition') selectCondition: MatSelect;
  @ViewChild('selectOverallStatus') selectOverallStatus: MatSelect;
  @ViewChild('selectFacilityCountry') selectFacilityCountry: MatSelect;
  @ViewChild('selectFacilityState') selectFacilityState: MatSelect;
  @ViewChild('selectFacilityCity') selectFacilityCity: MatSelect;

  // `FormGroup` to encompass the filter form controls.
  formFilters: FormGroup;

  // Possible overall-status values (to be populated in `ngOnInit`).
  private overallStatuses: {id: string, name: string}[];
  // Possible intervention values (to be populated in `ngOnInit`).
  private interventions: UniqueDescriptor[];
  // Possible condition values (to be populated in `ngOnInit`).
  private conditions: UniqueDescriptor[];
  // Possible country values (to be populated in `ngOnInit`).
  private facilityCountries: StudyLocationInterface[] = [];
  // Possible state values (to be populated in `ngOnInit`).
  private facilityStates: StudyLocationInterface[] = [];
  // Possible city values (to be populated in `ngOnInit`).
  private facilityCities: StudyLocationInterface[] = [];
  // Current position defined either through auto-detection or provided via a
  // location search.
  private currentPosition: {longitude: number, latitude: number} = null;
  // Possible locations retrieved by forward geocoding via the
  // `GeoLocationService`.
  public locationsAll: ReplaySubject<MapBoxFeature[]> =
    new ReplaySubject<MapBoxFeature[]>(1);
  public distancesMaxKmAll: number[] = [
    10, 25, 50, 100, 500, 1000, 5000, 1000000
  ];

    // Replay-subject storing the latest filtered overall-statuses.
  public overallStatusesFiltered: ReplaySubject<EnumInterface[]> =
    new ReplaySubject<EnumInterface[]>(1);
  // Replay-subject storing the latest filtered interventions.
  public interventionsFiltered: ReplaySubject<UniqueDescriptor[]> =
    new ReplaySubject<UniqueDescriptor[]>(1);
  // Replay-subject storing the latest filtered conditions.
  public conditionsFiltered: ReplaySubject<UniqueDescriptor[]> =
    new ReplaySubject<UniqueDescriptor[]>(1);
  // Replay-subject storing the latest filtered facility-countries.
  public facilityCountriesFiltered: ReplaySubject<StudyLocationInterface[]> =
    new ReplaySubject<StudyLocationInterface[]>(1);
  // Replay-subject storing the latest filtered facility-states.
  public facilityStatesFiltered: ReplaySubject<StudyLocationInterface[]> =
    new ReplaySubject<StudyLocationInterface[]>(1);
  // Replay-subject storing the latest filtered facility-cities.
  public facilityCitiesFiltered: ReplaySubject<StudyLocationInterface[]> =
    new ReplaySubject<StudyLocationInterface[]>(1);

  // Subject that emits when the component has been destroyed.
  private _onDestroy = new Subject<void>();

  // Studies columns to display.
  displayedColumns: string[] = [
    'actions',
    'name',
    'country',
    'locality',
    'administrativeAreaLevel1',
    'countStudies',
    'topInterventions',
  ];
  // Facilities table data-source.
  dataSourceFacilities: FacilitiesDatasource;
  // Page-size options used in the facilities-table paginator.
  facilitiesPageSizeOptions = [10, 25, 50];
  // Total number of facilities used in the facilities-table paginator.
  facilitiesCount: number;

  public topFacilityMeshTerms: {[key: string]: DescriptorInterface[]} = {};

  // The studies returned by the search.
  public studies: StudyInterface[];

  constructor(
    private authService: AuthService,
    private userConfigService: UserConfigService,
    private studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private geolocationService: GeolocationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    // Initialize the `locationsAll` subject with an empty array.
    this.locationsAll.next([]);

    // Retrieve the referenced search UUID.
    const searchUuid: string
      = this.route.parent.snapshot.params['searchUuid'];

    // Retrieve the referenced search.
    const search: SearchInterface
      = this.userConfigService.getUserSearch(searchUuid);

    // If the component was called with a search UUID defined in the path but
    // the search cannot be found in the `userConfigService` then redirect the
    // user to the `SearchesGridComponent`.
    if (searchUuid) {
      if (search) {
        this.studies = search.studies;
      } else {
        const result = this.router.navigate(['/app', 'searches']);
        result.then();
      }
    }

    // Convert the referenced overall-status enum members and convert them to
    // an array of `{id: key, name: value}` objects which can be used in the
    // filter element.
    this.overallStatuses = overallStatusGroups['all']
      .map(
        (member) => {
          return {
            id: Object.keys(StudyOverallStatus)
              .find(key => StudyOverallStatus[key] === member),
            name: member.valueOf(),
          };
        }
      );

    this.dataSourceFacilities = new FacilitiesDatasource(
      this.studyStatsRetrieverService
    );

    // Initialize the filter-form controls.
    this.formFilters = new FormGroup({
      // Multi-select for overall-status.
      selectOverallStatus: new FormControl(null),
      // Filter for overall-status.
      filterOverallStatus: new FormControl(null),
      // Multi-select for intervention.
      selectIntervention: new FormControl(null),
      // Filter for intervention.
      filterIntervention: new FormControl(null),
      // Multi-select for condition.
      selectCondition: new FormControl(null),
      // Filter for condition.
      filterCondition: new FormControl(null),
      // Multi-select for facility-country.
      selectFacilityCountry: new FormControl(null),
      // Filter for facility-country.
      filterFacilityCountry: new FormControl(null),
      // Multi-select for facility-state.
      selectFacilityState: new FormControl(null),
      // Filter for facility-state.
      filterFacilityState: new FormControl(null),
      // Multi-select for facility-city.
      selectFacilityCity: new FormControl(null),
      // Filter for facility-city.
      filterFacilityCity: new FormControl(null),
      // Current location input.
      currentLocation: new FormControl(null),
      // Select for the maximum distance from the current location.
      selectDistanceMax: new FormControl(null),
    });

    this.dataSourceFacilities.facilitiesSubject.subscribe(
      (results: StudiesCountByFacilityInterface[]) => {
        // Iterate over the aggregation results and retrieve the top 3
        // intervention MeSH descriptors per facility.
        for (const result of results) {
          this.studyStatsRetrieverService
          .getCountStudiesByFacilityDescriptor(
            this.studies,
            [result.facilityCanonical.facilityCanonicalId],
            MeshTermType.INTERVENTION,
            3
          ).subscribe(
            (response) => {
              this.topFacilityMeshTerms[
                result.facilityCanonical.facilityCanonicalId
                ] = response.map(
                function (entry) {
                  return entry.meshTerm;
                }
              );
            }
          );
        }
      }
    );

    // Retrieve the initial set of facilities.
    this.getFacilitiesPage();

    // Set the initial list of overall-statuses.
    this.overallStatusesFiltered.next(this.overallStatuses.slice());

    // Retrieve the unique interventions for this search's studies.
    this.studyStatsRetrieverService.getUniqueDescriptors(
      this.studies,
      MeshTermType.INTERVENTION,
    ).map(
      // Sort returned descriptors alphabetically.
      (uniqueDescriptors: DescriptorInterface[]) => {
        return orderObjectArray(uniqueDescriptors, 'name');
      }
    ).map(
      // Cast returned conditions to an array of objects with `id`, `name`, and
      // `descriptor` properties that can be used in a multi-select component.
      (uniqueDescriptors: DescriptorInterface[]) => {
        const uniqueInterventions: UniqueDescriptor[] = [];
        for (const descriptor of uniqueDescriptors) {
          uniqueInterventions.push({
            id: descriptor.descriptorId,
            name: descriptor.name,
            descriptor: descriptor,
          });
        }
        return uniqueInterventions;
      }
    ).subscribe(
      (uniqueInterventions: UniqueDescriptor[]) => {
        this.interventions = uniqueInterventions;
        this.interventionsFiltered.next(uniqueInterventions);
      }
    );

    // Retrieve the unique conditions for this search's studies.
    this.studyStatsRetrieverService.getUniqueDescriptors(
      this.studies,
      MeshTermType.CONDITION,
    ).map(
      // Sort returned descriptors alphabetically.
      (uniqueDescriptors: DescriptorInterface[]) => {
        return orderObjectArray(uniqueDescriptors, 'name');
      }
    ).map(
      // Cast returned conditions to an array of objects with `id`, `name`, and
      // `descriptor` properties that can be used in a multi-select component.
      (uniqueDescriptors: DescriptorInterface[]) => {
        const uniqueConditions: UniqueDescriptor[] = [];
        for (const descriptor of uniqueDescriptors) {
          uniqueConditions.push({
            id: descriptor.descriptorId,
            name: descriptor.name,
            descriptor: descriptor,
          });
        }
        return uniqueConditions;
      }
    ).subscribe(
      (uniqueConditions: UniqueDescriptor[]) => {
        this.conditions = uniqueConditions;
        this.conditionsFiltered.next(uniqueConditions);
      }
    );

    // Retrieve the unique countries for this search's studies.
    this.studyStatsRetrieverService.getUniqueCountries(
      this.studies,
    ).map(
      // Sort returned countries alphabetically.
      (uniqueCountries: string[]) => {
        return orderStringArray(uniqueCountries);
      }
    ).map(
      // Cast returned countries to an array of objects with `id` and `name`
      // properties that can be used in a multi-select component.
      (uniqueCountries: string[]) => {
        let counter = 1;
        const uniqueCountriesMap: {id: number, name: string}[] = [];
        for (const country of uniqueCountries) {
          if (!country) {
            continue;
          }
          uniqueCountriesMap.push({id: counter, name: country});
          counter++;
        }
        return uniqueCountriesMap;
      }
    ).subscribe(
      (uniqueCountriesMap: {id: number, name: string}[]) => {
        this.facilityCountries = uniqueCountriesMap;
        this.facilityCountriesFiltered.next(uniqueCountriesMap);
      }
    );

    // Retrieve the unique states/regions for this search's studies.
    this.studyStatsRetrieverService.getUniqueStates(
      this.studies,
    ).map(
      // Sort returned states alphabetically.
      (uniqueStates: string[]) => {
        return orderStringArray(uniqueStates);
      }
    ).map(
      // Cast returned states to an array of objects with `id` and `name`
      // properties that can be used in a multi-select component.
      (uniqueStates: string[]) => {
        let counter = 1;
        const uniqueStatesMap: {id: number, name: string}[] = [];
        for (const state of uniqueStates) {
          if (!state) {
            continue;
          }
          uniqueStatesMap.push({id: counter, name: state});
          counter++;
        }
        return uniqueStatesMap;
      }
    ).subscribe(
      (uniqueStatesMap: {id: number, name: string}[]) => {
        this.facilityStates = uniqueStatesMap;
        this.facilityStatesFiltered.next(uniqueStatesMap);
      }
    );

    // Retrieve the unique cities for this search's studies.
    this.studyStatsRetrieverService.getUniqueCities(
      this.studies,
    ).map(
      // Sort returned cities alphabetically.
      (uniqueCities: string[]) => {
        return orderStringArray(uniqueCities);
      }
    ).map(
      // Cast returned cities to an array of objects with `id` and `name`
      // properties that can be used in a multi-select component.
      (uniqueCities: string[]) => {
        let counter = 1;
        const uniqueCitiesMap: {id: number, name: string}[] = [];
        for (const city of uniqueCities) {
          uniqueCitiesMap.push({id: counter, name: city});
          counter++;
        }
        return uniqueCitiesMap;
      }
    ).subscribe(
      (uniqueCitiesMap: {id: number, name: string}[]) => {
        this.facilityCities = uniqueCitiesMap;
        this.facilityCitiesFiltered.next(uniqueCitiesMap);
      }
    );

    this.formFilters
      .get('filterOverallStatus')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterOverallStatuses();
      });

    this.formFilters
      .get('filterIntervention')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterInterventions();
      });

    this.formFilters
      .get('filterCondition')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterConditions();
      });

    this.formFilters
      .get('filterFacilityCountry')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterFacilityCountries();
      });

    this.formFilters
      .get('filterFacilityState')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterFacilityStates();
      });

    this.formFilters
      .get('filterFacilityCity')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterFacilityCities();
      });

    // Subscribe to the `valueChanges` observable of the location input control
    // and perform a search for matching locations with a 400ms debounce so
    // that we don't perform a search for every keystroke.
    this.formFilters.get('currentLocation')
      .valueChanges
      .pipe(debounceTime(400))
      .subscribe(
      (query) => {
        // If the incoming value is of type `string` then perform a synonym
        // search through the `GeolocationService` and update the `locationsAll`
        // subject with the results.
        if (typeof query === 'string') {
          this.geolocationService.geocodeForward(query)
            .subscribe(
              (response: MapBoxGeocodeResponse) => {
                this.locationsAll.next(response.features);
              }
            );
        }
      }
    );
  }

  ngAfterViewInit() {
    // Reset the paginator after sorting.
    this.sort.sortChange
      .subscribe(() => this.paginator.pageIndex = 0);

    // Subscribe to pagination events to refresh the studies.
    this.paginator.page
      .pipe(
        merge(this.sort.sortChange)
      ).pipe(
      tap(() => this.getFacilitiesPage())
    ).subscribe();

    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  private setInitialValue() {
    this.overallStatusesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.selectOverallStatus.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.interventionsFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectIntervention.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.conditionsFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectCondition.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.facilityCountriesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectFacilityCountry.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.facilityStatesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectFacilityState.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.facilityCitiesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectFacilityCity.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });
  }

  private filterOverallStatuses() {
    if (!this.overallStatuses) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterOverallStatus').value;

    // If no query was provided emit all possible overall-status values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.overallStatusesFiltered.next(this.overallStatuses.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible overall-status values based on the search query
    // and emit the results.
    this.overallStatusesFiltered.next(
      this.overallStatuses.filter(
        status => status.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterInterventions() {
    if (!this.interventions) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterIntervention').value;

    // If no query was provided emit all possible intervention values. Otherwise
    // lowercase the query in preparation for filtering.
    if (!query) {
      this.interventionsFiltered.next(this.interventions.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible intervention values based on the search query and
    // emit the results.
    this.interventionsFiltered.next(
      this.interventions.filter(
        type => type.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterConditions() {
    if (!this.conditions) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterCondition').value;

    // If no query was provided emit all possible condition values. Otherwise
    // lowercase the query in preparation for filtering.
    if (!query) {
      this.conditionsFiltered.next(this.conditions.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible condition values based on the search query and emit
    // the results.
    this.conditionsFiltered.next(
      this.conditions.filter(
        type => type.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterFacilityCountries() {
    if (!this.facilityCountries) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterFacilityCountry').value;

    // If no query was provided emit all possible facility-country values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.facilityCountriesFiltered.next(this.facilityCountries.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible facility-countries values based on the search query
    // and emit the results.
    this.facilityCountriesFiltered.next(
      this.facilityCountries.filter(
        country => country.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterFacilityStates() {
    if (!this.facilityStates) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterFacilityState').value;

    // If no query was provided emit all possible facility-state values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.facilityStatesFiltered.next(this.facilityStates.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible facility-states values based on the search query and
    // emit the results.
    this.facilityStatesFiltered.next(
      this.facilityStates.filter(
        state => state.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterFacilityCities() {
    if (!this.facilityCities) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterFacilityCity').value;

    // If no query was provided emit all possible facility-city values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.facilityCitiesFiltered.next(this.facilityCities.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible facility-cities values based on the search query and
    // emit the results.
    this.facilityCitiesFiltered.next(
      this.facilityCities.filter(
        city => city.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  getFacilitiesPage() {

    let countries: string[] = [];
    let states: string[] = [];
    let cities: string[] = [];
    let overallStatuses: string[] = [];
    let interventions: DescriptorInterface[] = [];
    let conditions: DescriptorInterface[] = [];
    let currentLocationLongitude: number = null;
    let currentLocationLatitude: number = null;
    let distanceMaxKm: number = null;

    // Retrieve the names of the selected countries (if any).
    if (this.formFilters.get('selectFacilityCountry').value) {
      countries = this.formFilters.get('selectFacilityCountry')
        .value.map((entry) => entry.name);
    }

    // Retrieve the names of the selected states (if any).
    if (this.formFilters.get('selectFacilityState').value) {
      states = this.formFilters.get('selectFacilityState')
        .value.map((entry) => entry.name);
    }

    // Retrieve the names of the selected cities (if any).
    if (this.formFilters.get('selectFacilityCity').value) {
      cities = this.formFilters.get('selectFacilityCity')
        .value.map((entry) => entry.name);
    }

    // Retrieve the selected overall-statuses (if any).
    if (this.formFilters.get('selectOverallStatus').value) {
      overallStatuses = this.formFilters.get('selectOverallStatus')
        .value.map((entry) => entry.id);
    } else {
      overallStatuses = this.overallStatuses
        .map((entry) => entry.id);
    }

    // Retrieve the selected interventions (if any).
    if (this.formFilters.get('selectIntervention').value) {
      interventions = this.formFilters.get('selectIntervention')
        .value.map((entry) => entry.descriptor);
    }

    // Retrieve the selected conditions (if any).
    if (this.formFilters.get('selectCondition').value) {
      conditions = this.formFilters.get('selectCondition')
        .value.map((entry) => entry.descriptor);
    }

    const descriptors: DescriptorInterface[] = interventions.concat(conditions);

    // Retrieve the selected current coordinates (if any).
    if (this.currentPosition) {
      currentLocationLongitude = this.currentPosition.longitude;
      currentLocationLatitude = this.currentPosition.latitude;
    }

    // Retrieve the selected maximum distance (if any).
    if (this.formFilters.get('selectDistanceMax').value) {
      distanceMaxKm = this.formFilters.get('selectDistanceMax').value;
    }

    let sortActive: string = null;
    if (this.sort.active) {
      if (this.sort.active !== 'countStudies') {
        sortActive = this.sort.active;
      }
    }

    // Retrieve facilities using the selected filters.
    this.dataSourceFacilities.filterFacilities(
      this.studies,
      descriptors || null,
      countries || null,
      states || null,
      cities || null,
      currentLocationLongitude || null,
      currentLocationLatitude || null,
      distanceMaxKm || null,
      overallStatuses || null,
      sortActive,
      OrderType[this.sort.direction.toUpperCase()] || null,
      this.paginator.pageSize || this.facilitiesPageSizeOptions[0],
      this.paginator.pageIndex * this.paginator.pageSize,
    );

    // Retrieve the number of facilities matching the current filters.
    this.studyStatsRetrieverService.countFacilities(
      this.studies,
      descriptors || null,
      countries || null,
      states || null,
      cities || null,
      currentLocationLongitude || null,
      currentLocationLatitude || null,
      distanceMaxKm || null,
      overallStatuses || null,
    ).subscribe(
      (facilitiesCount: number) => {
        this.facilitiesCount = facilitiesCount;
      }
    );
  }

  /**
   * Resets all filters to their default values and reloads facilities.
   */
  onResetFilters() {
    // Reset the paginator.
    this.paginator.pageIndex = 0;

    // Reset the form to its initial values.
    this.formFilters.reset();

    // Refresh the facilities to reflect the reset filters.
    this.getFacilitiesPage();
  }

  /**
   * Loads facilities using the current filter values.
   */
  onSubmitFilters() {
    // Reset the paginator.
    this.paginator.pageIndex = 0;

    // Refresh the studies to reflect the selected filters.
    this.getFacilitiesPage();
  }

  /**
   * Navigates to the `StudiesListComponent` with a predefined facility so that
   * only studies for the given facility are shown.
   * @param facility The facility for which to navigate.
   */
  onNavigateToFacility(facility: FacilityCanonicalInterface) {

    // Retrieve the referenced search UUID.
    const searchUuid: string
      = this.route.parent.snapshot.params['searchUuid'];

    const result = this.router.navigate(
      [
        '/app',
        'searches',
        searchUuid,
        'trials',
        'all',
      ],
      {state: {facilityCanonical: facility}}
    );
    result.then();
  }

  /**
   * Auto-detects the current location coordinates through the browser and then
   * uses the MapBox API via the `GeolocationService` to find the locality the
   * coordinates correspond to which it populates in the `currentLocation`
   * input.
   */
  onDetectLocation() {
    // Get the current location coordinates through the browser.
    this.geolocationService.getCurrentPositionBrowser({})
      .subscribe(
        (position: Position) => {
          // Set the coordinates to `currentPosition`.
          this.currentPosition = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          };
          // Perform a reverse-geocoding request to identify the possible
          // places the retrieved coordinates may correspond to.
          this.geolocationService.geocodeReverse(
            position.coords.longitude,
            position.coords.latitude,
          ).subscribe(
            (response: MapBoxGeocodeResponse) => {
              // Find the first `locality` feature and set the value of the
              // `currentLocation` input to its name.
              for (const feature of response.features) {
                if (feature.place_type.indexOf('locality') > -1) {
                  this.formFilters
                    .get('currentLocation').setValue(feature.place_name);
                  break;
                }
              }
            }
          );
        }
      );
  }

  /**
   * Uses the selected location out of the location auto-complete, sets that
   * location's name as the input value and sets the location's center
   * coordinates to `currentPosition`.
   * @param event The event triggered when a location from the location
   * auto-complete is selected.
   */
  onLocationSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected location.
    const location = event.option.value;
    // Clear the form input's value.
    this.formFilters.get('currentLocation').setValue(location.place_name);
    this.currentPosition = this.currentPosition = {
      longitude: location.center[0],
      latitude: location.center[1],
    };
  }

  /**
   * Opens the Google Maps URL for the given facility in a new tab.
   * @param facilityCanonical The facility for which the Google Maps URL will
   * be assembled and navigated to.
   */
  onNavigateGoogleMaps(facilityCanonical: FacilityCanonicalInterface): void {
    // Escape clause.
    if (!facilityCanonical.googlePlaceId) {
      return;
    }

    // Assemble the Google Maps URL as per
    // https://developers.google.com/maps/documentation/urls/guide#search-action
    // and https://stackoverflow.com/a/44137931/403211.
    const url = 'https://www.google.com/maps/search/' +
      '?api=1&query=Google' +
      '&query_place_id=' + facilityCanonical.googlePlaceId;

    // Open in a new tab.
    window.open(url, '_blank');
  }

}
