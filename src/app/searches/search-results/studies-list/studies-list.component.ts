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
  MatDialog,
  MatDialogConfig,
} from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { merge, take, takeUntil, tap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import {
  IonRangeSliderCallback,
  IonRangeSliderComponent,
} from 'ng2-ion-range-slider';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';
import {
  FacilityCanonicalInterface,
  MeshTermInterface,
  MeshTermType,
  OrderType,
  StudyInterface,
  StudyOverallStatus,
  StudyPhase,
  StudyType,
} from '../../../interfaces/study.interface';
import { StudiesDataSource } from './studies.datasource';
import {
  StudyRetrieverService
} from '../../../services/study-retriever.service';
import {
  castEnumToArray,
  castMeshTermType,
  castOverallStatus,
  orderStringArray,
} from '../../../shared/utils';
import {
  StudyStatsRetrieverService,
} from '../../../services/study-stats-retriever.service';
import {
  AgeRange,
  DateRange,
  YearRange,
  overallStatusGroups,
} from '../../../shared/common.interface';
import { StudyPreviewDialogComponent } from './study-preview-dialog/study-preview-dialog.component';


interface EnumInterface {
  id: string;
  name: string;
}

interface StudyLocationInterface {
  id: number
  name: string
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
  @ViewChild('sliderYearRange') sliderYearRange: IonRangeSliderComponent;
  @ViewChild('sliderAgeRange') sliderAgeRange: IonRangeSliderComponent;

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
  // Possible start-date year values (to be populated in `ngOnInit`).
  public studyStartDateRangeAll: DateRange = {
    dateBeg: new Date('1900-01-01'),
    dateEnd: new Date('2100-12-31'),
  };
  // Selected start-date year values (to be populated in `ngOnInit`).
  public studyStartYearRangeSelected: YearRange = {
    yearBeg: null,
    yearEnd: null,
  };
  // Possible eligibility age-range values in years (to be populated in
  // `ngOnInit`).
  public studyEligibilityAgeRangeAll: AgeRange = {ageBeg: 0, ageEnd: 150};
  public studyEligibilityAgeRangeSelected: AgeRange = {
    ageBeg: null,
    ageEnd: null,
  };


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
  // An observable indicating whether the total number of studies populating
  // `studiesCount` which is used in the paginator is being loaded.
  isLoadingStudiesCount: Observable<boolean>;

  // The search the component will display results for.
  public search: SearchInterface;

  constructor(
    private searchesService: SearchesService,
    private studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.searchesService.getSearch(searchUuid);

    // Retrieve the referenced overall-status.
    const overallStatusGroup = this.route.snapshot.params['overallStatus'];
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

    // Retrieve a reference to the observable defining whether the total number
    // of studies is being loaded.
    this.isLoadingStudiesCount =
      this.studyRetrieverService.isLoadingCountStudies;

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
      radioStudySex: new FormControl(null),
    });

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
      this.search.studies,
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
      this.search.studies,
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
      this.search.studies,
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

    // Query out the date-range of this search's studies to populate the slider
    // range.
    this.studyStatsRetrieverService.getStartDateRange(
      this.search.studies
    ).subscribe(
      (range: DateRange) => {
        this.studyStartDateRangeAll = range;
      }
    );

    // Query out the eligibility age-range of this search's studies to populate
    // the slider range.
    this.studyStatsRetrieverService.getEligibilityAgeRange(
      this.search.studies
    ).subscribe(
      (range: AgeRange) => {
        this.studyEligibilityAgeRangeAll = {
          ageBeg: Math.floor(range.ageBeg / 31536000.0),
          ageEnd: Math.ceil(range.ageEnd / 31536000.0),
        };
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

    // Retrieve studies using the selected filters.
    this.dataSourceStudies.filterStudies(
      this.search.studies,
      countries || null,
      states || null,
      cities || null,
      overallStatuses || null,
      null,
      phases || null,
      studyTypes || null,
      this.studyStartYearRangeSelected.yearBeg || null,
      this.studyStartYearRangeSelected.yearEnd || null,
      this.studyEligibilityAgeRangeSelected.ageBeg || null,
      this.studyEligibilityAgeRangeSelected.ageEnd || null,
      this.sort.active || 'nctId',
      OrderType[this.sort.direction.toUpperCase()] || null,
      this.paginator.pageSize || this.studiesPageSizeOptions[0],
      this.paginator.pageIndex * this.paginator.pageSize,
    );

    // Retrieve the number of studies matching the current filters.
    this.studyRetrieverService.countStudies(
      this.search.studies,
      countries || null,
      states || null,
      cities || null,
      overallStatuses || null,
      null,
      phases || null,
      studyTypes || null,
      this.studyStartYearRangeSelected.yearBeg || null,
      this.studyStartYearRangeSelected.yearEnd || null,
      this.studyEligibilityAgeRangeSelected.ageBeg || null,
      this.studyEligibilityAgeRangeSelected.ageEnd || null,
    ).subscribe(
      (studiesCount: number) => {
        this.studiesCount = studiesCount;
      }
    );
  }

  getStudyInterventionMeshTerms(
    study: StudyInterface,
  ): MeshTermInterface[] | string | null {
    const meshTerms: MeshTermInterface[] = [];

    for (const studyMeshTerm of study.studyMeshTerms) {
      const meshTermType = castMeshTermType(studyMeshTerm.meshTermType);
      if (meshTermType === MeshTermType.INTERVENTION) {
        meshTerms.push(studyMeshTerm.meshTerm);
      }
    }

    if (meshTerms.length === 1) {
      return meshTerms[0].term;
    } else if (meshTerms.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

  getStudyConditionMeshTerms(
    study: StudyInterface,
  ): MeshTermInterface[] | string | null {
    const meshTerms: MeshTermInterface[] = [];

    for (const studyMeshTerm of study.studyMeshTerms) {
      const meshTermType = castMeshTermType(studyMeshTerm.meshTermType);
      if (meshTermType === MeshTermType.CONDITION) {
        meshTerms.push(studyMeshTerm.meshTerm);
      }
    }

    if (meshTerms.length === 1) {
      return meshTerms[0].term;
    } else if (meshTerms.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

  getStudyLocation(
    study: StudyInterface,
  ): string | null {
    if (study.facilitiesCanonical.length === 1) {
      const facility: FacilityCanonicalInterface = study.facilitiesCanonical[0];
      const components: string[] = [
        facility.locality,
        facility.administrativeAreaLevel1,
        facility.country,
      ];
      return components.join(', ');
    } else if (study.facilitiesCanonical.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

  castOverallStatus(status: string): StudyOverallStatus {
    return castOverallStatus(status);
  }

  onSliderYearRangeFinish(event: IonRangeSliderCallback) {
    this.studyStartYearRangeSelected.yearBeg = event.from || null;
    this.studyStartYearRangeSelected.yearEnd = event.to || null;
  }

  onSliderAgeRangeFinish(event: IonRangeSliderCallback) {
    this.studyEligibilityAgeRangeSelected.ageBeg = event.from || null;
    this.studyEligibilityAgeRangeSelected.ageEnd = event.to || null;
  }

  /**
   * Resets all filters to their default values and reloads studies.
   */
  onResetFilters() {
    // Reset the paginator.
    this.paginator.pageIndex = 0;

    // Reset the form to its initial values.
    this.formFilters.reset();
    // Reset the year-range to its initial values.
    this.sliderYearRange.reset();
    this.studyStartYearRangeSelected.yearBeg = null;
    this.studyStartYearRangeSelected.yearEnd = null;
    // Reset the year-range to its initial values.
    this.sliderAgeRange.reset();
    this.studyEligibilityAgeRangeSelected.ageBeg = null;
    this.studyEligibilityAgeRangeSelected.ageEnd = null;

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

  onOpenStudyPreviewDialog(study: StudyInterface) {

    const dialogConfig: MatDialogConfig = new MatDialogConfig();

    // Automatically focus on the dialog elements.
    dialogConfig.autoFocus = true;
    // Allow the user from closing the dialog by clicking outside.
    dialogConfig.disableClose = false;
    // Make the dialog cast a shadow on the rest of the UI behind it and
    // preclude the user from interacting with it.
    dialogConfig.hasBackdrop = true;
    // Make the dialog auto-close if the user navigates away from it.
    dialogConfig.closeOnNavigation = true;
    // Set the dialog dimensions to 60% of the window dimensions.
    dialogConfig.width = '60%';
    dialogConfig.height = '60%';
    // Set a custom CSS class to the dialog container.
    dialogConfig.panelClass = 'preview-dialog-container';

    // Pass the currently selected study ID to the dialog.
    dialogConfig.data = {
      studyId: study.studyId
    };

    this.dialog.open(StudyPreviewDialogComponent, dialogConfig);
  }
}
