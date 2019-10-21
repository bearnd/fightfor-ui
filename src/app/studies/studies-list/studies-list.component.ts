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

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
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
  filterValues,
  flattenFacilityCanonical,
  orderObjectArray,
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
import { Subscription } from 'rxjs/Subscription';
import { DescriptorInterface } from '../../interfaces/descriptor.interface';


interface EnumInterface {
  id: string;
  name: string;
}

interface StudyLocationInterface {
  id: number;
  name: string;
}

enum Mode {
  SEARCH = 'Search',
  SAVED = 'Saved',
}

interface UniqueGeo {
  id: number;
  name: string;
}

interface UniqueFacility {
  id: number;
  name: string;
  facility: FacilityCanonicalInterface;
}


@Component({
  selector: 'app-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss'],
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
  @ViewChild('selectStudyFacility') selectStudyFacility: MatSelect;

  // `FormGroup` to encompass the filter form controls.
  formFilters: FormGroup;

  // Possible overall-status values (to be populated in `ngOnInit`).
  private overallStatuses: { id: string, name: string }[];
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
  private currentPosition: { longitude: number, latitude: number } = null;
  // Possible locations retrieved by forward geocoding via the
  // `GeoLocationService`.
  public locationsAll: ReplaySubject<MapBoxFeature[]> =
    new ReplaySubject<MapBoxFeature[]>(1);
  public distancesMaxKmAll: number[] = [
    10, 25, 50, 100, 500, 1000, 5000, 1000000
  ];
  // Possible facility  values (to be populated in `ngOnInit`).
  private studyFacilities: UniqueFacility[] = [];

  // Predefined geographical entities.
  private predefinedCountry: string = null;
  private predefinedState: string = null;
  private predefinedCity: string = null;
  private predefinedFacility: FacilityCanonicalInterface = null;

  // Whether the `Detect Location` button should be enabled.
  public isDetectLocationEnabled = true;

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
  // Replay-subject storing the latest filtered study-facilities.
  public studyFacilitiesFiltered: ReplaySubject<UniqueFacility[]> =
    new ReplaySubject<UniqueFacility[]>(1);

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
  public studies: StudyInterface[] = [];
  private subscriptionIsUpdatingUserStudies: Subscription = null;

  public overallStatusGroup = 'all';

  private loadingCurrentLocation: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isLoadingCurrentLocation: Observable<boolean>
    = this.loadingCurrentLocation.asObservable();

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

    // Retrieve the referenced overall-status and fallback to `all` if
    // undefined.
    if (this.route.snapshot.params['overallStatus']) {
      this.overallStatusGroup = this.route.snapshot.params['overallStatus'];
    }

    // Convert the referenced overall-status enum members and convert them to
    // an array of `{id: key, name: value}` objects which can be used in the
    // filter element.
    this.overallStatuses = overallStatusGroups[this.overallStatusGroup]
      .map(
        (member) => {
          return {
            id: Object.keys(StudyOverallStatus)
              .find(key => StudyOverallStatus[key] === member),
            name: member.valueOf(),
          };
        }
      );

    // If the component was called with a search UUID defined in the path but
    // the search cannot be found in the `userConfigService` then redirect the
    // user to the `SearchesGridComponent`.
    if (searchUuid) {
      if (search) {
        this.mode = Mode.SEARCH;

        // If a subset of study overall-statuses was selected upon navigating to
        // this component then set `this.studies` to the studies with an
        // overall-status matching the ones defined in `this.overallStatuses` to
        // preclude studies with a non-matching overall-status from populating
        // the subsequent with values that will conflict with the selected
        // overall-statuses. Otherwise, if all overall-statuses have been
        // selected then simply copy over all of the search's studies.
        if (this.overallStatusGroup === 'all') {
          this.studies = search.studies;
        } else {
          for (const study of search.studies) {
            for (const overallStatus of this.overallStatuses) {
              if (overallStatus.id === study.overallStatus.toString()) {
                this.studies.push(study);
              }
            }
          }
        }
      } else {
        const result = this.router.navigate(['/app', 'searches']);
        result.then();
      }
      // If the component was called without a search UUID defined in the path
      // then the user's saved studies are retrieved instead and displayed.
    } else {
      this.mode = Mode.SAVED;
      this.studies = this.userConfigService.userStudies || [];
    }

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
      // Current location input.
      currentLocation: new FormControl(null),
      // Select for the maximum distance from the current location.
      selectDistanceMax: new FormControl(null),
      // Multi-select for study-facility.
      selectStudyFacility: new FormControl(null),
      // Filter for study-facility.
      filterStudyFacility: new FormControl(null),
    });

    if (this.mode === Mode.SAVED) {
      this.subscriptionIsUpdatingUserStudies
        = this.userConfigService.isUpdatingUserStudies.subscribe(
        (isUpdatingUserStudies: boolean) => {
          if (!isUpdatingUserStudies) {
            this.studies = this.userConfigService.userStudies || [];
            this.getStudiesPage();
          }
        }
      );
    }

    // If, prior to navigating to this component, an initial facility value was
    // defined then set it as the only possible facility option in the form
    // controls and disable the controls.
    if (history.state.facilityCanonical) {
      this.predefineFacility(history.state.facilityCanonical);
    }

    // If, prior to navigating to this component, an initial country value was
    // defined then set it as the only possible country option in the form
    // controls and disable the controls.
    if (history.state.country) {
      this.predefineCountry(history.state.country);
    }

    // If, prior to navigating to this component, an initial state value was
    // defined then set it as the only possible state option in the form
    // controls and disable the controls.
    if (history.state.state) {
      this.predefineState(history.state.state);
    }

    // If, prior to navigating to this component, an initial city value was
    // defined then set it as the only possible city option in the form
    // controls and disable the controls.
    if (history.state.city) {
      this.predefineCity(history.state.city);
    }

    // Retrieve the initial set of studies.
    this.getStudiesPage();

    // Set the initial list of overall-statuses.
    this.overallStatusesFiltered.next(this.overallStatuses.slice());
    // Set the initial list of phases.
    this.phasesFiltered.next(this.phases.slice());
    // Set the initial list of study-types.
    this.studyTypesFiltered.next(this.studyTypes.slice());

    // Retrieve the unique countries for this search's studies. If an initial
    // country was defined then skip this step.
    if (!this.predefinedCountry && this.studies.length) {
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
          const uniqueCountriesMap: UniqueGeo[] = [];
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
        (uniqueCountriesMap: UniqueGeo[]) => {
          this.studyCountries = uniqueCountriesMap;
          this.studyCountriesFiltered.next(uniqueCountriesMap);
        }
      );
    }

    // Retrieve the unique states for this search's studies. If an initial
    // state was defined then skip this step.
    if (!this.predefinedState && this.studies.length) {
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
          const uniqueStatesMap: UniqueGeo[] = [];
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
        (uniqueStatesMap: UniqueGeo[]) => {
          this.studyStates = uniqueStatesMap;
          this.studyStatesFiltered.next(uniqueStatesMap);
        }
      );
    }

    // Retrieve the unique cities for this search's studies. If an initial
    // city was defined then skip this step.
    if (!this.predefinedCity && this.studies.length) {
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
          const uniqueCitiesMap: UniqueGeo[] = [];
          for (const city of uniqueCities) {
            uniqueCitiesMap.push({id: counter, name: city});
            counter++;
          }
          return uniqueCitiesMap;
        }
      ).subscribe(
        (uniqueCitiesMap: UniqueGeo[]) => {
          this.studyCities = uniqueCitiesMap;
          this.studyCitiesFiltered.next(uniqueCitiesMap);
        }
      );
    }

    // Retrieve the unique facilities for this search's studies. If an initial
    // facility was defined then skip this step.
    if (!history.state.facilityCanonical && this.studies.length) {
      this.studyStatsRetrieverService.getUniqueCanonicalFacilities(
        this.studies,
      ).map(
        // Sort returned cities alphabetically.
        (uniqueFacilities: FacilityCanonicalInterface[]) => {
          return orderObjectArray(
            uniqueFacilities,
            'facilityCanonicalId',
          );
        }
      ).map(
        // Cast returned facilities to an array of objects with `id`, `name` and
        // `facility` properties that can be used in a multi-select component.
        (uniqueFacilities: FacilityCanonicalInterface[]) => {
          const _uniqueFacilities: UniqueFacility[] = [];
          for (const facility of uniqueFacilities) {
            _uniqueFacilities.push({
              id: facility.facilityCanonicalId,
              name: facility.name,
              facility: facility,
            });
          }
          return _uniqueFacilities;
        }
      ).subscribe(
        (uniqueFacilities: UniqueFacility[]) => {
          this.studyFacilities = uniqueFacilities;
          this.studyFacilitiesFiltered.next(uniqueFacilities);
        }
      );
    }

    this.formFilters
      .get('filterOverallStatus')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.overallStatuses,
          this.formFilters.get('filterOverallStatus').value,
          this.overallStatusesFiltered,
          'name'
        );
      });

    this.formFilters
      .get('filterPhase')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.phases,
          this.formFilters.get('filterPhase').value,
          this.phasesFiltered,
          'name'
        );
      });

    this.formFilters
      .get('filterStudyType')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.studyTypes,
          this.formFilters.get('filterStudyType').value,
          this.studyTypesFiltered,
          'name'
        );
      });

    this.formFilters
      .get('filterStudyCountry')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.studyCountries,
          this.formFilters.get('filterStudyCountry').value,
          this.studyCountriesFiltered,
          'name'
        );
      });

    this.formFilters
      .get('filterStudyState')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.studyStates,
          this.formFilters.get('filterStudyState').value,
          this.studyStatesFiltered,
          'name'
        );
      });

    this.formFilters
      .get('filterStudyCity')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.studyCities,
          this.formFilters.get('filterStudyCity').value,
          this.studyCitiesFiltered,
          'name'
        );
      });

    this.formFilters
      .get('filterStudyFacility')
      .valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        filterValues(
          this.studyFacilities,
          this.formFilters.get('filterStudyFacility').value,
          this.studyFacilitiesFiltered,
          'name'
        );
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
      tap(() => this.getStudiesPage())
    ).subscribe();

    this.setInitialValue();

    // If there are no studies and the component is in 'saved' mode then show
    // an alert.
    if (!this.studies.length && this.mode === Mode.SAVED) {
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
   * Defines a predefined country as the only option under the filter controls
   * and disables those controls so that they can't be updated.
   * @param countryName The predefined country name.
   */
  private predefineCountry(countryName: string): void {
    this.predefinedCountry = countryName;
    // Create a singleton array containing only the predefined country.
    this.studyCountries = [{id: 0, name: this.predefinedCountry}];
    this.studyCountriesFiltered.next(this.studyCountries);
    // Set the single country as the current value.
    this.formFilters.get('selectStudyCountry').setValue(this.studyCountries);
    // Disable the country filter controls.
    this.formFilters.get('selectStudyCountry').disable();
    this.formFilters.get('filterStudyCountry').disable();
  }

  /**
   * Defines a predefined state as the only option under the filter controls
   * and disables those controls so that they can't be updated.
   * @param stateName The predefined state name.
   */
  private predefineState(stateName: string): void {
    this.predefinedState = stateName;
    // Create a singleton array containing only the predefined state.
    this.studyStates = [{id: 0, name: this.predefinedState}];
    this.studyStatesFiltered.next(this.studyStates);
    // Set the single state as the current value.
    this.formFilters.get('selectStudyState').setValue(this.studyStates);
    // Disable the state filter controls.
    this.formFilters.get('selectStudyState').disable();
    this.formFilters.get('filterStudyState').disable();
  }

  /**
   * Defines a predefined city as the only option under the filter controls
   * and disables those controls so that they can't be updated.
   * @param cityName The predefined city name.
   */
  private predefineCity(cityName: string): void {
    this.predefinedCity = cityName;
    // Create a singleton array containing only the predefined city.
    this.studyCities = [{id: 0, name: this.predefinedCity}];
    this.studyCitiesFiltered.next(this.studyCities);
    // Set the single city as the current value.
    this.formFilters.get('selectStudyCity').setValue(this.studyCities);
    // Disable the state filter controls.
    this.formFilters.get('selectStudyCity').disable();
    this.formFilters.get('filterStudyCity').disable();
  }

  /**
   * Defines a predefined facility as the only option under the filter controls
   * and disables those controls so that they can't be updated.
   * @param facility The predefined facility.
   */
  private predefineFacility(facility: FacilityCanonicalInterface): void {
    this.predefinedFacility = facility;
    // Create a singleton array containing only the predefined facility.
    this.studyFacilities = [{
      id: this.predefinedFacility.facilityCanonicalId,
      name: this.predefinedFacility.name,
      facility: this.predefinedFacility,
    }];
    this.studyFacilitiesFiltered.next(this.studyFacilities);
    // Set the single facility as the current value.
    this.formFilters.get('selectStudyFacility').setValue(this.studyFacilities);
    // Disable the facility filter controls.
    this.formFilters.get('selectStudyFacility').disable();
    this.formFilters.get('filterStudyFacility').disable();
    // Disable the current-location controls.
    this.formFilters.get('currentLocation').disable();
    this.formFilters.get('selectDistanceMax').disable();
    // Disable the `Detect Location` button.
    this.isDetectLocationEnabled = false;

    // Since a pre-defined facility defines a country, state, and city predefine
    // those quantities so that their corresponding controls are updated and
    // disabled.
    this.predefineCountry(this.predefinedFacility.country);
    this.predefineState(this.predefinedFacility.administrativeAreaLevel1);
    this.predefineCity(this.predefinedFacility.locality);
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

    this.studyFacilitiesFiltered
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectStudyFacility.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });
  }

  getStudiesPage() {

    if (!this.studies.length) {
      return;
    }

    let countries: string[] = [];
    let states: string[] = [];
    let cities: string[] = [];
    let facilityCanonicalIds: number[] = [];
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

    // Retrieve the IDs of the selected facilities (if any).
    if (this.formFilters.get('selectStudyFacility').value) {
      facilityCanonicalIds = this.formFilters.get('selectStudyFacility')
        .value.map((entry) => entry.id);
    }

    // Retrieve the selected overall-statuses (if any).
    if (this.formFilters.get('selectOverallStatus').value) {
      overallStatuses = this.formFilters.get('selectOverallStatus')
        .value.map((entry) => entry.id);
    } else {
      overallStatuses = this.overallStatuses
        .map((entry) => entry.id);
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
      facilityCanonicalIds || null,
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
      facilityCanonicalIds || null,
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
   * @param study The study for which the intervention MeSH terms will be
   * returned.
   * @returns The MeSH term string result.
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
   * @param study The study for which the condition MeSH terms will be returned.
   * @returns The MeSH term string result.
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
   * Creates a single location string out of the facilities of a
   * `StudyInterface` object. Should the study only have a single facility this
   * method returns its string representation based on the
   * `flattenFacilityCanonical` method. If there are more it suffixes the
   * flattened representation of the first facility with the number of
   * additional facilities.
   * @param study The study for which the location string will be created.
   * @returns The location string or null.
   */
  getStudyLocation(
    study: StudyInterface,
  ): string | null {

    if (study.facilitiesCanonical.length === 1) {
      return flattenFacilityCanonical(study.facilitiesCanonical[0]);
    } else if (study.facilitiesCanonical.length > 1) {
      const flattened = flattenFacilityCanonical(
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

    // Reset the form to its initial values. If an initial facility or country
    // value was defined then don't reset the two related form-controls.

    this.formFilters.get('selectOverallStatus').reset();
    this.formFilters.get('filterOverallStatus').reset();
    this.formFilters.get('selectPhase').reset();
    this.formFilters.get('filterPhase').reset();
    this.formFilters.get('selectStudyType').reset();
    this.formFilters.get('filterStudyType').reset();
    this.formFilters.get('currentLocation').reset();
    this.formFilters.get('selectDistanceMax').reset();

    if (!history.state.facilityCanonical) {
      this.formFilters.get('selectStudyFacility').reset();
      this.formFilters.get('filterStudyFacility').reset();
    }

    if (!this.predefinedCountry) {
      this.formFilters.get('selectStudyCountry').reset();
      this.formFilters.get('filterStudyCountry').reset();
    }

    if (!this.predefinedState) {
      this.formFilters.get('selectStudyState').reset();
      this.formFilters.get('filterStudyState').reset();
    }

    if (!this.predefinedCity) {
      this.formFilters.get('selectStudyCity').reset();
      this.formFilters.get('filterStudyCity').reset();
    }

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
   * @param study The study to which to navigate.
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
          'trials',
          this.overallStatusGroup,
          'trial',
          study.nctId,
        ],
        {relativeTo: this.route}
      );

      result.then();
    } else if (this.mode === Mode.SAVED) {
      const result = this.router.navigate(
        [
          '/app',
          'trials',
          study.nctId,
        ],
      );
      result.then();
    }
  }

  /**
   * Auto-detects the current location coordinates through the browser and then
   * uses the MapBox API via the `GeolocationService` to find the locality the
   * coordinates correspond to which it populates in the `currentLocation`
   * input.
   */
  onDetectLocation() {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingCurrentLocation.next(true);

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
              // Update the 'loading' observable to indicate that loading is in
              // progress.
              this.loadingCurrentLocation.next(false);
            },
            _ => this.loadingCurrentLocation.next(false)
          );
        },
        _ => this.loadingCurrentLocation.next(false)
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
   * Returns a boolean indicating whether a given study is followed by the user.
   * @param nctId The NCT ID of the study for which the check is performed.
   * @returns Whether the given study is followed by the user.
   */
  isStudyFollowed(nctId: string): boolean {
    return this.userConfigService.getUserStudy(nctId) !== null;
  }

  /**
   * Toggles the followed state of a given study for the current user through
   * the `followStudy` and `unfollowStudy` methods of the `UserConfigService`.
   * @param nctId The NCT ID of the study for which the followed state will be
   * toggled.
   */
  onToggleFollowStudy(nctId: string): void {
    if (this.isStudyFollowed(nctId)) {
      this.userConfigService.unfollowStudy(this.authService.userProfile, nctId);
    } else {
      this.userConfigService.followStudy(this.authService.userProfile, nctId);
    }
  }
}
