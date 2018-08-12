import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatPaginator, MatSelect, MatSort, MatTable } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { merge, take, takeUntil, tap } from 'rxjs/operators';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';
import {
  FacilityInterface,
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
import { StudyStatsRetrieverService } from '../../../services/study-stats-retriever.service';
import { AgeRange, DateRange } from '../../../shared/common.interface';


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

  // `FormGroup` to encompass the filter form controls.
  formFilters: FormGroup;

  // Possible overall-status values.
  private overallStatuses = castEnumToArray(StudyOverallStatus);
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
  public studyStartDateRange: DateRange = {
    dateBeg: new Date('1900-01-01'),
    dateEnd: new Date('2100-12-31'),
  };
  // Possible eligibility age-range values in years (to be populated in
  // `ngOnInit`).
  public studyEligibilityAgeRange: AgeRange = {ageBeg: 0, ageEnd: 150};


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
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.searchesService.getSearch(searchUuid);

    this.dataSourceStudies = new StudiesDataSource(this.studyRetrieverService);

    // Load the initial set of studies.
    this.dataSourceStudies.filterStudies(
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
      null,
      this.studiesPageSizeOptions[0],
      0,
    );

    this.isLoadingStudiesCount =
      this.studyRetrieverService.isLoadingCountStudies;
    this.studyRetrieverService.countStudies(
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
    ).subscribe(
      (studiesCount: number) => {
        this.studiesCount = studiesCount;
      }
    );

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

    // Load the initial list of phases.
    // Set the initial list of overall-statuses.
    this.overallStatusesFiltered.next(this.overallStatuses.slice());
    this.phasesFiltered.next(this.phases.slice());
    // Load the initial list of study-types.
    this.studyTypesFiltered.next(this.studyTypes.slice());

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
        this.studyStartDateRange = range;
      }
    );

    // Query out the eligibility age-range of this search's studies to populate
    // the slider range.
    this.studyStatsRetrieverService.getEligibilityAgeRange(
      this.search.studies
    ).subscribe(
      (range: AgeRange) => {
        this.studyEligibilityAgeRange = {
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

    this.dataSourceStudies.filterStudies(
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
      this.sort.active,
      OrderType[this.sort.direction.toUpperCase()],
      this.paginator.pageSize,
      this.paginator.pageIndex * this.paginator.pageSize,
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
    if (study.locations.length === 1) {
      const facility: FacilityInterface = study.locations[0].facility;
      const components: string[] = [
        facility.city,
        facility.state,
        facility.country,
      ];
      return components.join(', ');
    } else if (study.locations.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

  castOverallStatus(status: string): StudyOverallStatus {
    return castOverallStatus(status);
  }

}

