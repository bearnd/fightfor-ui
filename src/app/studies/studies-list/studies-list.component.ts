import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  MatSelect,
  MatTable,
  MatPaginator,
  MatSort,
  MatAutocompleteSelectedEvent,
} from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { debounceTime, merge, take, takeUntil, tap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import swal from 'sweetalert2';

import { SearchInterface } from '../../interfaces/user-config.interface';
import {
  FacilityCanonicalInterface,
  OrderType,
  StudyInterface,
  StudyOverallStatus,
  StudyPhase,
  StudyType,
} from '../../interfaces/study.interface';
import { StudiesDataSource } from './studies.datasource';
import {
  StudyRetrieverService
} from '../../services/study-retriever.service';
import {
  castEnumToArray,
  orderStringArray,
} from '../../shared/utils';
import {
  StudyStatsRetrieverService,
} from '../../services/study-stats-retriever.service';
import { overallStatusGroups } from '../../shared/common.interface';
import {
  GeolocationService,
  MapBoxFeature,
  MapBoxGeocodeResponse
} from '../../services/geolocation.service';
import { UserConfigService } from '../../services/user-config.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs/Rx';
import { DescriptorInterface } from '../../interfaces/descriptor.interface';


interface EnumInterface {
  id: string;
  name: string;
}

interface StudyLocationInterface {
  id: number
  name: string
}

enum Mode {
  SEARCH = 'Search',
  SAVED = 'Saved',
}


@Component({
  selector: 'app-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss']
})
export class StudiesListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('selectOverallStatus') selectOverallStatus: MatSelect;
  @ViewChild('selectPhase') selectPhase: MatSelect;
  @ViewChild('selectStudyType') selectStudyType: MatSelect;
  @ViewChild('selectStudyCountry') selectStudyCountry: MatSelect;
  @ViewChild('selectStudyState') selectStudyState: MatSelect;
  @ViewChild('selectStudyCity') selectStudyCity: MatSelect;

  // `FormGroup` to encompass the filter form controls.
  formFilters: FormGroup;

  // Possible overall-status values (to be populated in `ngOnInit`).
  private overallStatuses: {id: string, name: string}[];
  // Possible study-phase values.
  private phases = castEnumToArray(StudyPhase);
  // Possible study-type values.
  private studyTypes = castEnumToArray(StudyType);
  // Possible country values (to be populated in `ngOnInit`).
  private studyCountries: StudyLocationInterface[] = [];
  // Possible state values (to be populated in `ngOnInit`).
  private studyStates: StudyLocationInterface[] = [];
  // Possible city values (to be populated in `ngOnInit`).
  private studyCities: StudyLocationInterface[] = [];
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
  // Replay-subject storing the latest filtered study-phases.
  public phasesFiltered: ReplaySubject<EnumInterface[]> =
    new ReplaySubject<EnumInterface[]>(1);
  // Replay-subject storing the latest filtered study-types.
  public studyTypesFiltered: ReplaySubject<EnumInterface[]> =
    new ReplaySubject<EnumInterface[]>(1);
  // Replay-subject storing the latest filtered study-countries.
  public studyCountriesFiltered: ReplaySubject<StudyLocationInterface[]> =
    new ReplaySubject<StudyLocationInterface[]>(1);
  // Replay-subject storing the latest filtered study-states.
  public studyStatesFiltered: ReplaySubject<StudyLocationInterface[]> =
    new ReplaySubject<StudyLocationInterface[]>(1);
  // Replay-subject storing the latest filtered study-cities.
  public studyCitiesFiltered: ReplaySubject<StudyLocationInterface[]> =
    new ReplaySubject<StudyLocationInterface[]>(1);

  // Subject that emits when the component has been destroyed.
  private _onDestroy = new Subject<void>();

  // Studies columns to display.
  displayedColumns: string[] = [
    'actions',
    'briefTitle',
    'overallStatus',
    'conditions',
    'interventions',
    'locations',
  ];
  // Studies table data-source.
  dataSourceStudies: StudiesDataSource;
  // Page-size options used in the studies-table paginator.
  studiesPageSizeOptions = [10, 25, 50];
  // Total number of studies used in the studies-table paginator.
  studiesCount: number;

  // The mode in which the component is displayed which can either be
  // displaying the studies a user has saved or the study results pertaining to
  // a search.
  private mode: Mode = null;

  // The studies the component will display.
  public studies: StudyInterface[];
  private subscriptionIsUpdatingUserStudies: Subscription = null;

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
      = this.route.parent.parent.snapshot.params['searchUuid'];

    // Retrieve the referenced search.
    const search: SearchInterface
      = this.userConfigService.getUserSearch(searchUuid);

    // If the component was called with a search UUID defined in the path but
    // the search cannot be found in the `userConfigService` then redirect the
    // user to the `SearchesGridComponent`.
    if (searchUuid) {
      if (search) {
        this.studies = search.studies;
        this.mode = Mode.SEARCH;
      } else {
        const result = this.router.navigate(['/app', 'searches']);
        result.finally();
      }
      // If the component was called without a search UUID defined in the path
      // then the user's saved studies are retrieved instead and displayed.
    } else {
      this.studies = this.userConfigService.userStudies;
      this.mode = Mode.SAVED;
    }

    // Retrieve the referenced overall-status and fallback to `all` if
    // undefined.
    let overallStatusGroup = this.route.snapshot.params['overallStatus'];
    if (!overallStatusGroup) {
      overallStatusGroup = 'all';
    }

    // Convert the referenced overall-status enum members and convert them to
    // an array of `{id: key, name: value}` objects which can be used in the
    // filter element.
    this.overallStatuses = overallStatusGroups[overallStatusGroup]
      .map(
        (member) => {
          return {
            id: Object.keys(StudyOverallStatus)
              .find(key => StudyOverallStatus[key] === member),
            name: member.valueOf(),
          }
        }
      );

    this.dataSourceStudies = new StudiesDataSource(this.studyRetrieverService);

    // Initialize the filter-form controls.
    this.formFilters = new FormGroup({
      // Multi-select for overall-status.
      selectOverallStatus: new FormControl(null),
      // Filter for overall-status.
      filterOverallStatus: new FormControl(null),
      // Multi-select for phase.
      selectPhase: new FormControl(null),
      // Filter for phase.
      filterPhase: new FormControl(null),
      // Multi-select for study-type.
      selectStudyType: new FormControl(null),
      // Filter for study-type.
      filterStudyType: new FormControl(null),
      // Multi-select for study-country.
      selectStudyCountry: new FormControl(null),
      // Filter for study-country.
      filterStudyCountry: new FormControl(null),
      // Multi-select for study-state.
      selectStudyState: new FormControl(null),
      // Filter for study-state.
      filterStudyState: new FormControl(null),
      // Multi-select for study-city.
      selectStudyCity: new FormControl(null),
      // Filter for study-city.
      filterStudyCity: new FormControl(null),
      // Radio buttons for patient-sex.
      currentLocation: new FormControl(null),
      // Select for the maximum distance from the current location.
      selectDistanceMax: new FormControl(null),
    });

    if (this.mode === Mode.SAVED) {
      this.subscriptionIsUpdatingUserStudies
        = this.userConfigService.isUpdatingUserStudies.subscribe(
        (isUpdatingUserStudies: boolean) => {
          if (!isUpdatingUserStudies) {
            this.studies = this.userConfigService.userStudies;
            this.getStudiesPage();
          }
        }
      );
    }

    // Retrieve the initial set of studies.
    this.getStudiesPage();

    // Set the initial list of overall-statuses.
    this.overallStatusesFiltered.next(this.overallStatuses.slice());
    // Set the initial list of phases.
    this.phasesFiltered.next(this.phases.slice());
    // Set the initial list of study-types.
    this.studyTypesFiltered.next(this.studyTypes.slice());

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
        this.studyCountries = uniqueCountriesMap;
        this.studyCountriesFiltered.next(uniqueCountriesMap);
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
        this.studyStates = uniqueStatesMap;
        this.studyStatesFiltered.next(uniqueStatesMap);
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
        this.studyCities = uniqueCitiesMap;
        this.studyCitiesFiltered.next(uniqueCitiesMap);
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
      .get('filterPhase')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterPhases();
      });

    this.formFilters
      .get('filterStudyType')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStudyTypes();
      });

    this.formFilters
      .get('filterStudyCountry')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStudyCountries();
      });

    this.formFilters
      .get('filterStudyState')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStudyStates();
      });

    this.formFilters
      .get('filterStudyCity')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterStudyCities();
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
    )
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
      tap(() => this.getStudiesPage())
    ).subscribe();

    this.setInitialValue();

    // If there are no studies and the component is in 'saved' mode then show
    // an alert.
    if (!this.studies.length && this.mode === Mode.SEARCH) {
      swal({
        title: 'You have not followed any trials!',
        html: '<p>Please follow trials you are interested in by ' +
          'clicking the <i class="material-icons btn-rose" style=' +
          '"color: #e91e63">favorite_outline</i> button when viewing' +
          ' trials via a search.',
        showCancelButton: false,
        showConfirmButton: true,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-rose',
        confirmButtonText: 'Got it',
        type: 'info'
      }).catch(swal.noop);
    }

  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();

    if (this.subscriptionIsUpdatingUserStudies) {
      this.subscriptionIsUpdatingUserStudies.unsubscribe();
    }
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

    this.phasesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectPhase.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.studyTypesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectStudyType.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.studyCountriesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectStudyCountry.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.studyStatesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectStudyState.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });

    this.studyCitiesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectStudyCity.compareWith = (a, b) => {
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

  private filterPhases() {
    if (!this.phases) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterPhase').value;

    // If no query was provided emit all possible phase values. Otherwise
    // lowercase the query in preparation for filtering.
    if (!query) {
      this.phasesFiltered.next(this.phases.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible overall-status values based on the search query
    // and emit the results.
    this.phasesFiltered.next(
      this.phases.filter(
        phase => phase.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterStudyTypes() {
    if (!this.studyTypes) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterStudyType').value;

    // If no query was provided emit all possible study-type values. Otherwise
    // lowercase the query in preparation for filtering.
    if (!query) {
      this.studyTypesFiltered.next(this.studyTypes.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible study-types values based on the search query and emit
    // the results.
    this.studyTypesFiltered.next(
      this.studyTypes.filter(
        type => type.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterStudyCountries() {
    if (!this.studyCountries) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterStudyCountry').value;

    // If no query was provided emit all possible study-country values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.studyCountriesFiltered.next(this.studyCountries.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible study-countries values based on the search query and
    // emit the results.
    this.studyCountriesFiltered.next(
      this.studyCountries.filter(
        country => country.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterStudyStates() {
    if (!this.studyStates) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterStudyState').value;

    // If no query was provided emit all possible study-state values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.studyStatesFiltered.next(this.studyStates.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible study-states values based on the search query and
    // emit the results.
    this.studyStatesFiltered.next(
      this.studyStates.filter(
        state => state.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  private filterStudyCities() {
    if (!this.studyCities) {
      return;
    }
    // Retrieve the search query.
    let query = this.formFilters.get('filterStudyCity').value;

    // If no query was provided emit all possible study-city values.
    // Otherwise lowercase the query in preparation for filtering.
    if (!query) {
      this.studyCitiesFiltered.next(this.studyCities.slice());
      return;
    } else {
      query = query.toLowerCase();
    }

    // Filter the possible study-cities values based on the search query and
    // emit the results.
    this.studyCitiesFiltered.next(
      this.studyCities.filter(
        city => city.name.toLowerCase().indexOf(query) > -1
      )
    );
  }

  getStudiesPage() {

    let countries: string[] = [];
    let states: string[] = [];
    let cities: string[] = [];
    let overallStatuses: string[] = [];
    let phases: string[] = [];
    let studyTypes: string[] = [];
    let currentLocationLongitude: number = null;
    let currentLocationLatitude: number = null;
    let distanceMaxKm: number = null;

    // Retrieve the names of the selected countries (if any).
    if (this.formFilters.get('selectStudyCountry').value) {
      countries = this.formFilters.get('selectStudyCountry')
        .value.map((entry) => entry.name);
    }

    // Retrieve the names of the selected states (if any).
    if (this.formFilters.get('selectStudyState').value) {
      states = this.formFilters.get('selectStudyState')
        .value.map((entry) => entry.name);
    }

    // Retrieve the names of the selected cities (if any).
    if (this.formFilters.get('selectStudyCity').value) {
      cities = this.formFilters.get('selectStudyCity')
        .value.map((entry) => entry.name);
    }

    // Retrieve the selected overall-statuses (if any).
    if (this.formFilters.get('selectOverallStatus').value) {
      overallStatuses = this.formFilters.get('selectOverallStatus')
        .value.map((entry) => entry.id);
    } else {
      overallStatuses = this.overallStatuses
        .map((entry) => entry.id)
    }

    // Retrieve the selected study-phases (if any).
    if (this.formFilters.get('selectPhase').value) {
      phases = this.formFilters.get('selectPhase')
        .value.map((entry) => entry.id);
    }

    // Retrieve the selected study-types (if any).
    if (this.formFilters.get('selectStudyType').value) {
      studyTypes = this.formFilters.get('selectStudyType')
        .value.map((entry) => entry.id);
    }

    // Retrieve the selected current coordinates (if any).
    if (this.currentPosition) {
      currentLocationLongitude = this.currentPosition.longitude;
      currentLocationLatitude = this.currentPosition.latitude;
    }

    // Retrieve the selected maximum distance (if any).
    if (this.formFilters.get('selectDistanceMax').value) {
      distanceMaxKm = this.formFilters.get('selectDistanceMax').value;
    }

    // Retrieve studies using the selected filters.
    this.dataSourceStudies.filterStudies(
      this.studies,
      countries || null,
      states || null,
      cities || null,
      currentLocationLongitude || null,
      currentLocationLatitude || null,
      distanceMaxKm || null,
      overallStatuses || null,
      null,
      phases || null,
      studyTypes || null,
      null,
      null,
      null,
      null,
      this.sort.active || 'nctId',
      OrderType[this.sort.direction.toUpperCase()] || null,
      this.paginator.pageSize || this.studiesPageSizeOptions[0],
      this.paginator.pageIndex * this.paginator.pageSize,
    );

    // Retrieve the number of studies matching the current filters.
    this.studyRetrieverService.countStudies(
      this.studies,
      countries || null,
      states || null,
      cities || null,
      currentLocationLongitude || null,
      currentLocationLatitude || null,
      distanceMaxKm || null,
      overallStatuses || null,
      null,
      phases || null,
      studyTypes || null,
      null,
      null,
      null,
      null,
    ).subscribe(
      (studiesCount: number) => {
        this.studiesCount = studiesCount;
      }
    );
  }

  /**
   * Retrieves the intervention MeSH terms for a given study. If there is only
   * one such MeSH term it returns the name of that term. Should there be more
   * than one term it returns the name of the first term and includes a suffix
   * denoting how many additional terms exist.
   * @param {StudyInterface} study The study for which the intervention MeSH
   * terms will be returned.
   * @returns {string | null} The MeSH term string result.
   */
  getStudyInterventionMeshTerms(
    study: StudyInterface,
  ): string | null {
    const meshTerms: DescriptorInterface[] = [];

    for (const studyMeshTerm of study.studyDescriptors) {
      if (studyMeshTerm.studyDescriptorType.valueOf() === 'INTERVENTION') {
        meshTerms.push(studyMeshTerm.descriptor);
      }
    }

    // If there is only one such MeSH term it returns the name of that term.
    // Should there be more than one term it returns the name of the first term
    // and includes a suffix denoting how many additional terms exist.
    let result: string = null;
    if (meshTerms.length === 1) {
      result = meshTerms[0].name;
    } else if (meshTerms.length > 1) {
      result = meshTerms[0].name +
        ' (+' +
        String(meshTerms.length - 1) +
        ' more)';
    }

    return result;
  }

  /**
   * Retrieves the condition MeSH terms for a given study. If there is only
   * one such MeSH term it returns the name of that term. Should there be more
   * than one term it returns the name of the first term and includes a suffix
   * denoting how many additional terms exist.
   * @param {StudyInterface} study The study for which the condition MeSH
   * terms will be returned.
   * @returns {DescriptorInterface[] | string | null} The MeSH term string
   * result.
   */
  getStudyConditionMeshTerms(
    study: StudyInterface,
  ): DescriptorInterface[] | string | null {
    const meshTerms: DescriptorInterface[] = [];

    for (const studyMeshTerm of study.studyDescriptors) {
      if (studyMeshTerm.studyDescriptorType.valueOf() === 'CONDITION') {
        meshTerms.push(studyMeshTerm.descriptor);
      }
    }

    // If there is only one such MeSH term it returns the name of that term.
    // Should there be more than one term it returns the name of the first term
    // and includes a suffix denoting how many additional terms exist.
    let result: string = null;
    if (meshTerms.length === 1) {
      result = meshTerms[0].name;
    } else if (meshTerms.length > 1) {
      result = meshTerms[0].name +
        ' (+' +
        String(meshTerms.length - 1) +
        ' more)';
    }

    return result;
  }

  /**
   * Flattens the contents of a `FacilityCanonicalInterface` object into a
   * `locality, administrativeAreaLevel1, country` string allowing for one or
   * mode of these components to be missing.
   * @param facility {FacilityCanonicalInterface} The canonical facility object
   * to be flattened.
   * @returns {string | null} The flattened facility representation or null.
   */
  flattenFacilityCanonical(
    facility: FacilityCanonicalInterface,
  ): string | null {

    // Return `null` if the facility is not defined.
    if (!facility) {
      return null;
    }

    // Collect the facility components in an array.
    let components: string[] = [
      facility.locality,
      facility.administrativeAreaLevel1,
      facility.country,
    ];

    // Filter out components that are undefined, null, or empty strings.
    components = components.filter((x) => {
      return typeof x !== 'undefined' && x;
    });

    // Return the array above joined by commas.
    return components.join(', ');
  }

  /**
   * Creates a single location string out of the facilities of a
   * `StudyInterface` object. Should the study only have a single facility this
   * method returns its string representation based on the
   * `flattenFacilityCanonical` method. If there are more it suffixes the
   * flattened representation of the first facility with the number of
   * additional facilities.
   * @param study {StudyInterface} The study for which the location string will
   * be created.
   * @returns {string | null} The location string or null.
   */
  getStudyLocation(
    study: StudyInterface,
  ): string | null {

    if (study.facilitiesCanonical.length === 1) {
      return this.flattenFacilityCanonical(study.facilitiesCanonical[0]);
    } else if (study.facilitiesCanonical.length > 1) {
      const flattened = this.flattenFacilityCanonical(
        study.facilitiesCanonical[0]
      );
      return flattened +
        ' (+' +
        String(study.facilitiesCanonical.length - 1) +
        ' more)';
    } else {
      return null;
    }
  }

  castOverallStatus(status: string): StudyOverallStatus {
    return StudyOverallStatus[status];
  }

  /**
   * Resets all filters to their default values and reloads studies.
   */
  onResetFilters() {
    // Reset the paginator.
    this.paginator.pageIndex = 0;

    // Reset the form to its initial values.
    this.formFilters.reset();

    // Refresh the studies to reflect the reset filters.
    this.getStudiesPage();
  }

  /**
   * Loads studies using the current filter values.
   */
  onSubmitFilters() {
    // Reset the paginator.
    this.paginator.pageIndex = 0;

    // Refresh the studies to reflect the selected filters.
    this.getStudiesPage();
  }

  /**
   * Navigates to the details of a given study. Uses a different route
   * depending on whether this component is viewed to see the studies of a
   * search or the user's saved studies.
   * @param {StudyInterface} study The study to which to navigate.
   */
  onNavigateToStudy(study: StudyInterface) {

    if (this.mode === Mode.SEARCH) {
      // Retrieve the referenced search UUID.
      const searchUuid: string
        = this.route.parent.parent.snapshot.params['searchUuid'];

      const result = this.router.navigate(
        [
          '/app',
          'searches',
          searchUuid,
          'trial',
          study.nctId,
        ],
      );
      result.finally();
    } else if (this.mode === Mode.SAVED) {
      const result = this.router.navigate(
        [
          '/app',
          'trials',
          study.nctId,
        ],
      );
      result.finally();
    }
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
   * @param {MatAutocompleteSelectedEvent} event The event triggered when a
   * location from the location auto-complete is selected.
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
   * Returns a boolean indicating whether a given study is followed by the user.
   * @param {string} nctId The NCT ID of the study for which the check is
   * performed.
   * @returns {boolean} Whether the given study is followed by the user.
   */
  isStudyFollowed(nctId: string): boolean {
    return this.userConfigService.getUserStudy(nctId) !== null;
  }

  /**
   * Toggles the followed state of a given study for the current user through
   * the `followStudy` and `unfollowStudy` methods of the `UserConfigService`.
   * @param {string} nctId The NCT ID of the study for which the followed state
   * will be toggled.
   */
  onToggleFollowStudy(nctId: string): void {
    if (this.isStudyFollowed(nctId)) {
      this.userConfigService.unfollowStudy(this.authService.userProfile, nctId);
    } else {
      this.userConfigService.followStudy(this.authService.userProfile, nctId);
    }
  }
}
